const Exercise = require('../model/Exercise');
const WebSocket = require('ws');

/**
 * Text-to-Speech Service using Gemini Live API
 * Based on Python implementation: tts_live_stream.py
 */
class TTSService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not found in environment variables');
        }
        this.apiKey = process.env.GEMINI_API_KEY;
        this.modelName = 'gemini-2.5-flash-native-audio-latest';
    }

    /**
     * Convert PCM audio buffer to WAV format
     */
    pcmToWav(pcmData) {
        const sampleRate = 24000;
        const numChannels = 1;
        const bitsPerSample = 16;

        const blockAlign = numChannels * bitsPerSample / 8;
        const byteRate = sampleRate * blockAlign;
        const dataSize = pcmData.length;
        const fileSize = 44 + dataSize;

        const wavHeader = Buffer.alloc(44);
        wavHeader.write('RIFF', 0);
        wavHeader.writeUInt32LE(fileSize - 8, 4);
        wavHeader.write('WAVE', 8);
        wavHeader.write('fmt ', 12);
        wavHeader.writeUInt32LE(16, 16);
        wavHeader.writeUInt16LE(1, 20);
        wavHeader.writeUInt16LE(numChannels, 22);
        wavHeader.writeUInt32LE(sampleRate, 24);
        wavHeader.writeUInt32LE(byteRate, 28);
        wavHeader.writeUInt16LE(blockAlign, 32);
        wavHeader.writeUInt16LE(bitsPerSample, 34);
        wavHeader.write('data', 36);
        wavHeader.writeUInt32LE(dataSize, 40);

        return Buffer.concat([wavHeader, pcmData]);
    }

    /**
     * Generate audio using Gemini Live API (WebSocket)
     * With retry logic and validation
     */
    async generateAudio(text, maxRetries = 2) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`🔄 Retry ${attempt}/${maxRetries}: ${text.substring(0, 30)}...`);
                    await new Promise(r => setTimeout(r, 1000 * attempt));
                }

                const audioData = await this._generateAudioOnce(text);

                // Validate audio data
                if (!audioData || audioData.length < 1000) {
                    throw new Error(`Invalid audio: ${audioData?.length || 0} bytes`);
                }

                return audioData;
            } catch (error) {
                if (attempt === maxRetries) {
                    console.error(`❌ Failed after ${maxRetries} retries:`, error.message);
                    throw error;
                }
                console.warn(`⚠️ Attempt ${attempt + 1} failed:`, error.message);
            }
        }
    }

    async _generateAudioOnce(text) {
        return new Promise((resolve, reject) => {
            const audioChunks = [];
            const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
            const ws = new WebSocket(wsUrl);

            const timeout = setTimeout(() => {
                ws.close();
                reject(new Error('Timeout after 30s'));
            }, 30000);

            ws.on('open', () => {
                const setupMessage = {
                    setup: {
                        model: `models/${this.modelName}`,
                        generation_config: {
                            response_modalities: ['AUDIO']
                        }
                    }
                };
                ws.send(JSON.stringify(setupMessage));

                const prompt = `Please read the following text aloud clearly and naturally in its detected language: ${text}`;
                const contentMessage = {
                    client_content: {
                        turns: [{
                            role: 'user',
                            parts: [{ text: prompt }]
                        }],
                        turn_complete: true
                    }
                };
                ws.send(JSON.stringify(contentMessage));
            });

            ws.on('message', (data) => {
                try {
                    const response = JSON.parse(data.toString());
                    if (response.serverContent?.modelTurn?.parts) {
                        for (const part of response.serverContent.modelTurn.parts) {
                            if (part.inlineData?.data) {
                                const chunk = Buffer.from(part.inlineData.data, 'base64');
                                audioChunks.push(chunk);
                            }
                        }
                    }
                    if (response.serverContent?.turnComplete) {
                        ws.close();
                    }
                } catch (error) {
                    clearTimeout(timeout);
                    ws.close();
                    reject(error);
                }
            });

            ws.on('close', () => {
                clearTimeout(timeout);
                if (audioChunks.length === 0) {
                    reject(new Error('No audio received'));
                    return;
                }
                const pcmBuffer = Buffer.concat(audioChunks);
                const wavBuffer = this.pcmToWav(pcmBuffer);
                console.log(`✅ Generated ${wavBuffer.length} bytes`);
                resolve(wavBuffer);
            });

            ws.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    /**
     * Get or generate cached audio for an exercise
     */
    /**
     * Get or generate audio for an exercise
     * DIRECT PASS-THROUGH (No DB Caching)
     */
    async getOrGenerateAudio(exerciseId, sessionId) {
        // No DB check - generate fresh every time or let client cache
        console.log(`⚡ Generating audio for exercise ${exerciseId} (Direct Mode)`);

        const exercise = await Exercise.findById(exerciseId);
        if (!exercise) {
            throw new Error('Exercise not found');
        }

        if (!exercise.audioUrl) {
            throw new Error('Exercise has no audio text');
        }

        // Generate audio directly
        const audioData = await this.generateAudio(exercise.audioUrl);

        console.log(`✅ Generated audio for ${exerciseId}: ${audioData.length} bytes`);

        return {
            audioData: audioData,
            mimeType: 'audio/wav'
        };
    }

    /**
     * Prefetch audio for multiple exercises
     * Max concurrency for speed (User request)
     */
    async prefetchAudio(exerciseIds, sessionId) {
        console.log(`🚀 Prefetching ${exerciseIds.length} audio files in parallel...`);

        const prefetchPromises = exerciseIds.map(async (exerciseId) => {
            try {
                await this.getOrGenerateAudio(exerciseId, sessionId);
            } catch (error) {
                console.error(`Failed to prefetch audio for ${exerciseId}:`, error.message);
            }
        });

        await Promise.all(prefetchPromises);
        console.log(`✅ Prefetched ${exerciseIds.length} audio files`);
    }

    /**
     * Delete cached audio for specific exercise
     */
    async deleteAudio(exerciseId, sessionId) {
        const result = await AudioCache.deleteOne({ exerciseId, sessionId });
        if (result.deletedCount > 0) {
            console.log(`🗑️ Deleted audio cache for exercise ${exerciseId}`);
        }
        return result;
    }

    /**
     * Cleanup all cached audio for a session
     */
    async cleanupSession(sessionId) {
        const result = await AudioCache.deleteMany({ sessionId });
        console.log(`🧹 Cleaned up ${result.deletedCount} audio files for session ${sessionId}`);
        return result;
    }

    /**
     * Get cache statistics for a session
     */
    async getCacheStats(sessionId) {
        const count = await AudioCache.countDocuments({ sessionId });
        const caches = await AudioCache.find({ sessionId }).select('exerciseId createdAt');

        return {
            count,
            exercises: caches.map(c => ({
                exerciseId: c.exerciseId,
                cachedAt: c.createdAt
            }))
        };
    }
}

module.exports = new TTSService();

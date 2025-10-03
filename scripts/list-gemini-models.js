#!/usr/bin/env node

/**
 * List Available Gemini Models
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyAzkVbq62x1nFlB9JEQVEI5ky6z8glshWY';

async function listModels() {
  try {
    console.log('🔍 Listing available Gemini models...');
    
    const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Try to list models
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + GEMINI_API_KEY);
    const data = await response.json();
    
    console.log('📋 Available models:');
    if (data.models) {
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
      });
    } else {
      console.log('❌ Could not fetch models:', data);
    }
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

listModels();

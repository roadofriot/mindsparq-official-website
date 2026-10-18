import { describe, it, expect } from 'vitest';
import { searchAdminContent, getMatchingHints } from '../services/searchService';
import { classifyPromptIntent, getIntentLoadingStatus } from '../services/geminiService';

describe('Universal Deep Search — Context & Element Level Indexing', () => {
  it('successfully finds contact@mindsparqeducation.com.np in settings and page elements', async () => {
    const hits = await searchAdminContent('contact@');
    expect(hits.length).toBeGreaterThan(0);

    const emailHit = hits.find(h => h.subtitle?.includes('contact@mindsparqeducation.com.np') || h.title.includes('Email') || h.snippet.includes('contact@mindsparqeducation.com.np'));
    expect(emailHit).toBeDefined();
    expect(emailHit?.snippet).toContain('contact@mindsparqeducation.com.np');
  });

  it('finds campus location and phone number in institutional settings', async () => {
    const phoneHits = await searchAdminContent('9857058666');
    expect(phoneHits.length).toBeGreaterThan(0);
    expect(phoneHits[0].targetRoute).toBe('/admin/settings');

    const locationHits = await searchAdminContent('Kalikanagar');
    expect(locationHits.length).toBeGreaterThan(0);
  });

  it('generates interactive smart search hints for quick navigation', () => {
    const allHints = getMatchingHints('');
    expect(allHints.length).toBeGreaterThanOrEqual(5);

    const contactHints = getMatchingHints('contact');
    expect(contactHints.length).toBeGreaterThan(0);
    expect(contactHints[0].text).toContain('contact@mindsparqeducation.com.np');
  });
});

describe('AI Chatbot — Intent-Based Classification & Fast Path', () => {
  it('correctly classifies conversational greetings to fast-path mode', () => {
    expect(classifyPromptIntent('hi')).toBe('greeting');
    expect(classifyPromptIntent('Hello!')).toBe('greeting');
    expect(classifyPromptIntent('hey there')).toBe('greeting');
    expect(classifyPromptIntent('Namaste')).toBe('greeting');
    expect(classifyPromptIntent('how are you?')).toBe('greeting');
    expect(classifyPromptIntent('thanks')).toBe('greeting');
  });

  it('correctly classifies quick QA questions', () => {
    expect(classifyPromptIntent('What is AI?')).toBe('quick_qa');
    expect(classifyPromptIntent('Define robotics')).toBe('quick_qa');
    expect(classifyPromptIntent('What is abacus?')).toBe('quick_qa');
  });

  it('correctly classifies deep educational drafting requests', () => {
    expect(classifyPromptIntent('Create a complete lesson plan for Grade 5 on fractions')).toBe('deep_drafting');
    expect(classifyPromptIntent('Draft a 4-week beginner curriculum module on Drone Technology')).toBe('deep_drafting');
    expect(classifyPromptIntent('Write a blog post about why Robotics & AI matter')).toBe('deep_drafting');
  });

  it('generates contextual dynamic loading status without hardcoding', () => {
    expect(getIntentLoadingStatus('hi', 'Gemini 3.8 Flash')).toBe('Replying...');
    expect(getIntentLoadingStatus('What is AI?', 'Gemini 3.8 Flash')).toBe('Gemini 3.8 Flash is answering your question...');
    expect(getIntentLoadingStatus('Create a complete lesson plan', 'Gemini 3.8 Flash')).toBe('Gemini 3.8 Flash is drafting structured educational content...');
  });
});

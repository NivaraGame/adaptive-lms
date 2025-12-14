/**
 * Unit tests for content parser
 * Tests backend contract compliance
 */

import { describe, it, expect } from 'vitest';
import {
  parseLessonData,
  parseExerciseData,
  parseQuizData,
  parseContentData,
} from '../contentFormatter';

describe('parseLessonData', () => {
  it('parses lesson with introduction, sections, key_points', () => {
    const input = {
      introduction: 'HTTP is the foundation of web communication.',
      sections: [
        { heading: 'HTTP Methods', content: 'GET, POST, PUT, DELETE' },
        { heading: 'Status Codes', content: '200 OK, 404 Not Found' },
      ],
      key_points: ['HTTP is stateless', 'Methods define operations'],
    };

    const result = parseLessonData(input);

    expect(result.introduction).toBe('HTTP is the foundation of web communication.');
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0].heading).toBe('HTTP Methods');
    expect(result.key_points).toHaveLength(2);
  });

  it('handles missing fields gracefully', () => {
    const result = parseLessonData({});

    expect(result.introduction).toBe('');
    expect(result.sections).toEqual([]);
    expect(result.key_points).toEqual([]);
  });
});

describe('parseExerciseData', () => {
  it('parses exercise with question and starter_code', () => {
    const input = {
      question: 'Create a div with margin and padding',
      starter_code: '<div class="box">Content</div>',
      solution: '.box { margin: 20px; }',
      test_cases: ['Check margin', 'Verify padding'],
    };

    const result = parseExerciseData(input);

    expect(result.question).toBe('Create a div with margin and padding');
    expect(result.starter_code).toBe('<div class="box">Content</div>');
    expect(result.solution).toBe('.box { margin: 20px; }');
    expect(result.test_cases).toHaveLength(2);
  });

  it('handles exercise without starter_code', () => {
    const input = {
      question: 'What is 2+2?',
    };

    const result = parseExerciseData(input);

    expect(result.question).toBe('What is 2+2?');
    expect(result.starter_code).toBe('');
    expect(result.description).toBe('');
  });
});

describe('parseQuizData', () => {
  it('parses quiz with options and correct_answer', () => {
    const input = {
      question: 'Which HTTP status indicates success?',
      options: ['200 OK', '404 Not Found', '500 Error'],
      correct_answer: '200 OK',
      explanation: '200 OK indicates success.',
    };

    const result = parseQuizData(input);

    expect(result.question).toBe('Which HTTP status indicates success?');
    expect(result.options).toHaveLength(3);
    expect(result.correct_answer).toBe('200 OK');
    expect(result.explanation).toBe('200 OK indicates success.');
    expect(result.quiz_type).toBe('multiple_choice');
  });

  it('handles true_false quiz_type', () => {
    const input = {
      question: 'Is HTTP stateless?',
      options: ['True', 'False'],
      correct_answer: 'True',
      explanation: 'Yes, HTTP is stateless.',
      quiz_type: 'true_false',
    };

    const result = parseQuizData(input);

    expect(result.quiz_type).toBe('true_false');
  });
});

describe('parseContentData', () => {
  it('routes lesson content_type correctly', () => {
    const input = {
      introduction: 'Intro',
      sections: [],
      key_points: [],
    };

    const result = parseContentData(input, 'lesson', 'text');

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('introduction');
  });

  it('routes exercise content_type correctly', () => {
    const input = {
      question: 'Solve x + 2 = 5',
    };

    const result = parseContentData(input, 'exercise', 'text');

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('question');
  });

  it('routes quiz content_type correctly', () => {
    const input = {
      question: 'What is 2+2?',
      options: ['3', '4', '5'],
      correct_answer: '4',
      explanation: 'Basic math',
    };

    const result = parseContentData(input, 'quiz', 'text');

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('options');
  });

  it('returns null for invalid content_data', () => {
    const result = parseContentData(null as any, 'lesson', 'text');
    expect(result).toBeNull();
  });
});

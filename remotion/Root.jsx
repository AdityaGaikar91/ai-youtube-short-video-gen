import React from 'react';
import {Composition} from 'remotion';
import { MyComposition } from './Composition';
import RemotionComposition from './../app/_components/RemotionComposition';

const videoData = {
    audioUrl: '',
    captionJson: [
      {
        confidence: 0.99303764,
        end: 0.39999998,
        start: 0,
        word: "a",
      },
      {
        confidence: 0.9993574,
        end: 0.64,
        start: 0.39999998,
        word: "drop",
      },
      {
        confidence: 0.99993217,
        end: 0.79999995,
        start: 0.64,
        word: "of",
      },
      {
        confidence: 0.9998368,
        end: 1.04,
        start: 0.79999995,
        word: "water",
      },
      {
        confidence: 0.99971765,
        end: 1.28,
        start: 1.04,
        word: "might",
      },
      {
        confidence: 0.999337,
        end: 1.52,
        start: 1.28,
        word: "seem",
      },
      {
        confidence: 0.9721686,
        end: 2.3999999,
        start: 1.52,
        word: "insignificant",
      },
      {
        confidence: 0.9992797,
        end: 2.72,
        start: 2.3999999,
        word: "but",
      },
      {
        confidence: 0.99834526,
        end: 3.04,
        start: 2.72,
        word: "drop",
      },
      {
        confidence: 0.999666,
        end: 3.28,
        start: 3.04,
        word: "after",
      },
      {
        confidence: 0.9998803,
        end: 3.52,
        start: 3.28,
        word: "drop",
      },
      {
        confidence: 0.5400178,
        end: 3.76,
        start: 3.52,
        word: "it",
      },
      {
        confidence: 0.99979013,
        end: 3.9199998,
        start: 3.76,
        word: "can",
      },
      {
        confidence: 0.9990996,
        end: 4.24,
        start: 3.9199998,
        word: "carve",
      },
      {
        confidence: 0.9965154,
        end: 4.7999997,
        start: 4.24,
        word: "canyons",
      },
      {
        confidence: 0.9993698,
        end: 5.04,
        start: 4.7999997,
        word: "power",
      },
      {
        confidence: 0.9827826,
        end: 5.68,
        start: 5.04,
        word: "turbines",
      },
      {
        confidence: 0.9998543,
        end: 5.7599998,
        start: 5.68,
        word: "and",
      },
      {
        confidence: 0.9997061,
        end: 6,
        start: 5.7599998,
        word: "create",
      },
      {
        confidence: 0.9950924,
        end: 6.7999997,
        start: 6,
        word: "oceans",
      },
      {
        confidence: 0.9988147,
        end: 7.12,
        start: 6.7999997,
        word: "your",
      },
      {
        confidence: 0.99981767,
        end: 7.44,
        start: 7.12,
        word: "actions",
      },
      {
        confidence: 0.9998684,
        end: 7.68,
        start: 7.44,
        word: "might",
      },
      {
        confidence: 0.999508,
        end: 7.9199996,
        start: 7.68,
        word: "seem",
      },
      {
        confidence: 0.75562984,
        end: 8.4,
        start: 7.9199996,
        word: "small",
      },
      {
        confidence: 0.9998865,
        end: 8.48,
        start: 8.4,
        word: "but",
      },
      {
        confidence: 0.9997913,
        end: 9.04,
        start: 8.48,
        word: "consistency",
      },
      {
        confidence: 0.99988365,
        end: 9.36,
        start: 9.04,
        word: "is",
      },
      {
        confidence: 0.94138503,
        end: 9.919999,
        start: 9.36,
        word: "key",
      },
      {
        confidence: 0.99939156,
        end: 10.32,
        start: 10.08,
        word: "every",
      }
    ],
    images: ['https://firebasestorage.googleapis.com/v0/b/projects-2025-71366.firebasestorage.app/o/ai-guru-lab-images%2F1740340159841.png?alt=media&token=84df87d9-f53f-496e-a05d-fe7104499a38']
}
 
export const RemotionRoot = () => {
  return (
      <Composition
        id="youtubeShort"
        component={RemotionComposition}
        durationInFrames={Number((videoData?.captionJson[videoData?.captionJson?.length - 1]?.end * 30).toFixed(0))}
        fps={30}
        width={720}
        height={1280}
        defaultProps={{
          videoData:videoData
        }}
      />
  );
};
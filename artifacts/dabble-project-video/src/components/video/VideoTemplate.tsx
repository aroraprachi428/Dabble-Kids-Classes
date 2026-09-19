import {
  VideoCanvas,
  type VideoAspectRatio,
  useVideoPlayer,
} from '@/lib/video';
import { AnimatePresence } from 'framer-motion';

import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { CrossSceneElements } from './video_scenes/CrossSceneElements';

const SCENE_DURATIONS = {
  0: 4000, // Intro
  1: 5000, // Parents
  2: 5000, // Coaches
  3: 4500, // Ops
  4: 4000, // Outro
};

const VIDEO_ASPECT_RATIO: VideoAspectRatio = '16:9';

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({
    durations: SCENE_DURATIONS,
  });

  return (
    <VideoCanvas
      aspectRatio={VIDEO_ASPECT_RATIO}
      style={{ backgroundColor: 'var(--color-bg-light)', overflow: 'hidden' }}
    >
      <CrossSceneElements currentScene={currentScene} />

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="s1" />}
        {currentScene === 1 && <Scene2 key="s2" />}
        {currentScene === 2 && <Scene3 key="s3" />}
        {currentScene === 3 && <Scene4 key="s4" />}
        {currentScene === 4 && <Scene5 key="s5" />}
      </AnimatePresence>
    </VideoCanvas>
  );
}


import { Framework, Platform } from './types';

export const FRAMEWORKS: Framework[] = [
  Framework.AIDA,
  Framework.PAS,
  Framework.BAB,
  Framework.FourPs,
];

export const PLATFORM_CONFIG = {
  [Platform.LinkedIn]: {
    charLimit: 3000,
  },
  [Platform.Twitter]: {
    charLimit: 280,
  },
};

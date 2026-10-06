import MDXComponents from '@theme-original/MDXComponents';
import GameCard, {CardGallery} from '@site/src/components/GameCard';
import GameIcon from '@site/src/components/GameIcon';
import {Choice, Log, Objective, Option, Options} from '@site/src/components/Guide';

// Components available in every guide page without an import.
export default {
  ...MDXComponents,
  GameCard,
  CardGallery,
  GameIcon,
  Options,
  Option,
  Log,
  Choice,
  Objective,
};

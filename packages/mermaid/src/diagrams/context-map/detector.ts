import type {
  DiagramDetector,
  DiagramLoader,
  ExternalDiagramDefinition,
} from '../../diagram-api/types.js';
const id = 'contextMap';

const detector: DiagramDetector = (txt) => {
  return /^\s*ContextMap/.test(txt);
};

const loader: DiagramLoader = async () => {
  const { diagram } = await import('./contextMap-definition.js');
  return { id, diagram };
};

const plugin: ExternalDiagramDefinition = {
  id,
  detector,
  loader,
};

export default plugin;

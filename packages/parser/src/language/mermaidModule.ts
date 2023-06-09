import {
  DefaultSharedModuleContext,
  LangiumServices,
  LangiumSharedServices,
  Module,
  PartialLangiumServices,
  createDefaultModule,
  createDefaultSharedModule,
  inject,
} from 'langium';

import {
  MermiadTokenBuilder,
  MermaidValueConverter,
  MermaidLexer,
  MermaidGeneratedSharedModule,
  MermaidGeneratedModule,
} from './index.js';

/**
 * Declaration of `Mermaid` services.
 */
export type MermaidAddedServices = {
  parser: {
    TokenBuilder: MermiadTokenBuilder;
    ValueConverter: MermaidValueConverter;
  };
};

/**
 * Union of Langium default services and `Mermaid` services.
 */
export type MermaidServices = LangiumServices & MermaidAddedServices;

/**
 * Dependency injection module that overrides Langium default services and
 * contributes the declared `Mermaid` services.
 */
export const MermaidModule: Module<MermaidServices, PartialLangiumServices & MermaidAddedServices> =
  {
    parser: {
      Lexer: (services) => new MermaidLexer(services),
      TokenBuilder: () => new MermiadTokenBuilder(),
      ValueConverter: () => new MermaidValueConverter(),
    },
  };

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 * @param context - Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createMermaidServices(context: DefaultSharedModuleContext): {
  shared: LangiumSharedServices;
  Mermaid: MermaidServices;
} {
  const shared = inject(createDefaultSharedModule(context), MermaidGeneratedSharedModule);
  const Mermaid = inject(createDefaultModule({ shared }), MermaidGeneratedModule, MermaidModule);
  shared.ServiceRegistry.register(Mermaid);
  return { shared, Mermaid };
}

import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { ManifestSection } from '@umbraco-cms/backoffice/extension-registry';


export const onInit: UmbEntryPointOnInit = (_host, extensionRegistry) => {
    console.log('Hello from my custom Umbraco extension!', extensionRegistry);
    

    //extensionRegistry.register(manifest);
};
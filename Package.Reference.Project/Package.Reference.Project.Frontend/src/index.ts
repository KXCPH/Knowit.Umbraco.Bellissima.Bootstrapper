import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';


export const onInit: UmbEntryPointOnInit = (_host, extensionRegistry) => {
    console.log("hej mor!", extensionRegistry)
};
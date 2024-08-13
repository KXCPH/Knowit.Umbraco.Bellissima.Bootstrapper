import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { ManifestSection, ManifestSectionView, ManifestSectionSidebarApp } from '@umbraco-cms/backoffice/extension-registry';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { OpenAPI } from './api/index.ts';

export const onInit: UmbEntryPointOnInit = async (_host, extensionRegistry) => {
    

    _host.consumeContext(UMB_AUTH_CONTEXT, async (auth) => {
        if (!auth) return;

        const umbOpenApi = auth.getOpenApiConfiguration();
        OpenAPI.BASE = umbOpenApi.base;
        OpenAPI.TOKEN = umbOpenApi.token;
        OpenAPI.WITH_CREDENTIALS = umbOpenApi.withCredentials;
        OpenAPI.CREDENTIALS = umbOpenApi.credentials;
    });
    
    const section : ManifestSection = {
        alias: 'myCustomSection',
        name: 'My Custom Section',
        type: 'section',
        meta: {
            label: 'Knowit',
            pathname: 'knowit'
        }
    }

    const view : ManifestSectionView = {
        alias: 'myCustomSectionView',
        name: 'My Custom Section View',
        type: "sectionView",
        elementName: "knowit-section-view",
        js: () => import('./elements/section-view'),
        meta: {
            label: 'Knowit',
            pathname: 'knowit',
            icon: 'icon-umb-contour',
        },
        conditions: [
            {
                alias: 'Umb.Condition.SectionAlias',
                match: 'myCustomSection'
            }
        ]
    }

    const tree : ManifestSectionSidebarApp = {
        alias: 'myCustomSectionTree',
        name: 'My Custom Section Tree',
        type: 'sectionSidebarApp',
        elementName: 'knowit-section-tree',
        js: () => import('./elements/section-tree'),
        conditions: [
            {
                alias: 'Umb.Condition.SectionAlias',
                match: 'myCustomSection'
            }
        ]
    }
    
    extensionRegistry.register(section);
    extensionRegistry.register(view);
    extensionRegistry.register(tree);
};

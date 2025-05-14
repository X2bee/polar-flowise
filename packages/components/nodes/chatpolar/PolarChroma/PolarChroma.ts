import { flatten } from 'lodash'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { Embeddings } from '@langchain/core/embeddings'
import { Document } from '@langchain/core/documents'
import { ICommonObject, INode, INodeData, INodeOutputsValue, INodeParams, INodeOptionsValue } from '../../../src/Interface'
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils'
import { ChromaExtended } from './core'

type KnowledgeResponse = {
    id: string
    name: string
    files: {
        id: string
        meta: {
            name: string
        }
    }[]
}[]

class Polar_Chroma_VectorStores implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    badge: string
    baseClasses: string[]
    inputs: INodeParams[]
    credential: INodeParams
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'PolarChroma'
        this.name = 'polarchroma'
        this.version = 2.0
        this.type = 'PolarChroma'
        this.icon = 'chroma.svg'
        this.category = 'Chat Polar Models'
        this.description = 'Upsert embedded data and perform similarity search upon query using Chroma, an open-source embedding database'
        this.baseClasses = [this.type, 'VectorStoreRetriever', 'BaseRetriever']

        this.inputs = [
            {
                label: 'Embeddings',
                name: 'embeddings',
                type: 'Embeddings'
            },
            {
                label: 'Record Manager',
                name: 'recordManager',
                type: 'RecordManager',
                description: 'Keep track of the record to prevent duplication',
                optional: true
            },
            {
                label: 'Collection Name',
                name: 'collectionName',
                type: 'asyncOptions',
                loadMethod: 'loadCollections',
            },
            {
                label: 'Chroma Metadata Filter',
                name: 'chromaMetadataFilter',
                type: 'json',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Top K',
                name: 'topK',
                description: 'Number of top results to fetch. Default to 4',
                placeholder: '4',
                type: 'number',
                additionalParams: true,
                optional: true
            }
        ]

        this.outputs = [
            {
                label: 'Chroma Retriever',
                name: 'retriever',
                baseClasses: this.baseClasses
            },
            {
                label: 'Chroma Vector Store',
                name: 'vectorStore',
                baseClasses: [this.type, ...getBaseClasses(Chroma)]
            }
        ]
    }

    loadMethods = {
        async loadCollections(): Promise<INodeOptionsValue[]> {
            try {
                const response = await fetch('http://open-webui:8080/api/v1/knowledge', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer polarops123secretkey`
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }

                const data: KnowledgeResponse = await response.json();
                const result: INodeOptionsValue[] = [];

                for (const item of data) {
                    result.push({
                        label: `[Collection] ${item.name}`,
                        name: item.id
                    });

                    if (Array.isArray(item.files)) {
                        for (const file of item.files) {
                            result.push({
                                label: `[File] ${file.meta.name}`,
                                name: file.id
                            });
                        }
                    }
                }

                return result;
            } catch (err) {
                console.error('[fetchKnowledge] Failed to fetch knowledge:', err);
                return [];
            }
        }
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const collectionName = nodeData.inputs?.collectionName as string
        const embeddings = nodeData.inputs?.embeddings as Embeddings
        const chromaURL = 'http://polar-chroma:8000'
        const output = nodeData.inputs?.output as string
        const topK = nodeData.inputs?.topK as string
        const k = topK ? parseFloat(topK) : 4

        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        const chromaApiKey = getCredentialParam('chromaApiKey', credentialData, nodeData)
        const chromaTenant = getCredentialParam('chromaTenant', credentialData, nodeData)
        const chromaDatabase = getCredentialParam('chromaDatabase', credentialData, nodeData)

        const chromaMetadataFilter = nodeData.inputs?.chromaMetadataFilter

        const obj: {
            collectionName: string
            url?: string
            chromaApiKey?: string
            chromaTenant?: string
            chromaDatabase?: string
            filter?: object | undefined
        } = { collectionName }

        if (chromaURL) obj.url = chromaURL
        if (chromaApiKey) obj.chromaApiKey = chromaApiKey
        if (chromaTenant) obj.chromaTenant = chromaTenant
        if (chromaDatabase) obj.chromaDatabase = chromaDatabase

        if (chromaMetadataFilter) {
            try {
                const metadatafilter = typeof chromaMetadataFilter === 'object'
                    ? chromaMetadataFilter
                    : JSON.parse(chromaMetadataFilter)
                obj.filter = metadatafilter
            } catch (e) {
                console.warn('[Chroma] Invalid metadata filter JSON:', chromaMetadataFilter)
            }
        }

        const vectorStore = await ChromaExtended.fromExistingCollection(embeddings, obj)

        if (output === 'retriever') {
            const retriever = vectorStore.asRetriever(k)
            return retriever
        } else if (output === 'vectorStore') {
            ;(vectorStore as any).k = k
            if (chromaMetadataFilter) {
                ;(vectorStore as any).filter = obj.filter
            }
            return vectorStore
        }

        return vectorStore
    }
}

module.exports = { nodeClass: Polar_Chroma_VectorStores }

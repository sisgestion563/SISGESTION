export const GRUPOS_DOCUMENTOS = {

    DOC_NOR: {
        codigo: 'DOC_NOR',
        nombre: 'Documentos Normativos',
        usaCatalogo: true
    },

    DOC_EXT_NOR: {
        codigo: 'DOC_EXT_NOR',
        nombre: 'Documentos Extra Normativos',
        usaCatalogo: false
    },

    DOC_REQ_ESTATAL: {
        codigo: 'DOC_REQ_ESTATAL',
        nombre: 'Documentos Req. Estatal',
        usaCatalogo: false
    },

    DOC_OTROS: {
        codigo: 'DOC_OTROS',
        nombre: 'Documentos Otros',
        usaCatalogo: false
    }

};

export const LISTA_GRUPOS = [
    GRUPOS_DOCUMENTOS.DOC_NOR,
    GRUPOS_DOCUMENTOS.DOC_EXT_NOR,
    GRUPOS_DOCUMENTOS.DOC_REQ_ESTATAL,
    GRUPOS_DOCUMENTOS.DOC_OTROS
];
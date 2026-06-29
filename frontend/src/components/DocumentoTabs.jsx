import {
    LISTA_GRUPOS
} from '../constants/documentos.constants';

export default function DocumentoTabs({

    grupoSeleccionado,
    onChange

}){

    return (

        <div
            style={{
                display:'flex',
                gap:'10px',
                marginBottom:'20px',
                flexWrap:'wrap'
            }}
        >

            {
                LISTA_GRUPOS.map(
                    grupo => (

                        <button

                            key={
                                grupo.codigo
                            }

                            className={
                                grupoSeleccionado === grupo.codigo
                                    ? 'btn-primary'
                                    : ''
                            }

                            onClick={()=>
                                onChange(
                                    grupo.codigo
                                )
                            }

                        >

                            {
                                grupo.nombre
                            }

                        </button>

                    )
                )
            }

        </div>

    );

}
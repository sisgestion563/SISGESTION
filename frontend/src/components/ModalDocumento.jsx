import {useState,useEffect} from 'react';
import {crearDocumento,actualizarDocumento} from '../services/documentos.service';
import {obtenerCatalogo} from '../services/catalogos.service';

// Misma paleta usada en el resto del sistema (Documentos, Dashboard, Proveedores)
const colors = {
    text: '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    amber: '#f59e0b',
    bgDisabled: '#f9fafb',
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(17,24,39,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        padding: '16px',
        boxSizing: 'border-box',
    },
    modal: {
        width: '680px',
        maxWidth: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#fff',
        borderRadius: '16px',
        padding: '28px 32px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        boxSizing: 'border-box',
    },
    headerTitle: {
        fontSize: '20px',
        fontWeight: 700,
        color: colors.text,
        margin: 0,
    },
    headerSubtitle: {
        fontSize: '13px',
        fontWeight: 600,
        color: colors.textMuted,
        margin: '4px 0 0 0',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
    },
    divider: {
        border: 'none',
        borderTop: `1px solid ${colors.border}`,
        margin: '18px 0 20px 0',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '18px 20px',
    },
    fieldFull: {
        gridColumn: '1 / -1',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '13px',
        fontWeight: 700,
        color: colors.text,
    },
    input: {
        padding: '10px 12px',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        fontSize: '14px',
        color: colors.text,
        outline: 'none',
        boxSizing: 'border-box',
        width: '100%',
        background: '#fff',
    },
    inputDisabled: {
        background: colors.bgDisabled,
        color: colors.textMuted,
        cursor: 'not-allowed',
    },
    textarea: {
        padding: '10px 12px',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        fontSize: '14px',
        color: colors.text,
        outline: 'none',
        boxSizing: 'border-box',
        width: '100%',
        resize: 'vertical',
        fontFamily: 'inherit',
    },
    readOnlyValue: {
        padding: '10px 12px',
        borderRadius: '8px',
        background: colors.bgDisabled,
        border: `1px solid ${colors.border}`,
        fontSize: '14px',
        color: colors.text,
        minHeight: '20px',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '26px',
        paddingTop: '18px',
        borderTop: `1px solid ${colors.border}`,
    },
    btnPrimary: {
        background: colors.primary,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 22px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    btnGhost: {
        background: '#fff',
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '10px 22px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
    },
};

const responsiveCSS = `
    @media (max-width: 640px) {
        .modal-doc-grid { grid-template-columns: 1fr !important; }
    }
`;

export default function ModalDocumento({visible,
										onClose,
										onSuccess,
										proveedorId,
										documentosExistentes = [],
										regimenTributario,
										grupoDocumento,
										modo = 'NUEVO',
										documento = null}) 
	{

		const formInicial = {tipo_documento_id: '',
							tipo_documento: '',
							fecha_inicio: '',
							fecha_fin: '',
							fecha_vigencia: '',
							alcance: '',
							ruta_documento: '',
							observaciones: ''};

		const MAPA_ALCANCES = {
			'DOC_NOR': [
				{ codigo_valor: 'GSG', descripcion: 'GESTIÓN SST' },
				{ codigo_valor: 'GMA', descripcion: 'GESTIÓN MA' }
			],
			'DOC_EXT_NOR': [
				{ codigo_valor: 'GCA', descripcion: 'GESTIÓN DE CALIDAD' }
			],
			'DOC_REQ_ESTATAL': [
				{ codigo_valor: 'GPA', descripcion: 'GESTIÓN PATRIMONIAL' }
			],
			'DOC_OTROS': [
				{ codigo_valor: 'GTR', descripcion: 'GESTIÓN TRANSPORTE' }
			]
		};

		const [form, setForm] = useState(formInicial);
		const [tiposDocumento, setTiposDocumento] = useState([]);
		const [errorMessage, setErrorMessage] = useState('');

		// Obtenemos las listas a partir de los mapas
		const alcances = MAPA_ALCANCES[grupoDocumento] || [];

		useEffect(() => {
			if (form.alcance) {
				obtenerCatalogo('0001', 'TIPO_DOC_' + form.alcance)
					.then(res => {
						let data = res.data ? res.data : res;
						
						if (form.alcance === 'GSG') {
							if (regimenTributario === 'RG') {
								const permitidos = ['01','02','03','04','05','06','07','08','09','10','11','12'];
								data = data.filter(d => permitidos.includes(d.codigo_valor));
							} else if (regimenTributario === 'RP') {
								const permitidos = ['01','02','03','04','05','07','09','10','12','15'];
								data = data.filter(d => permitidos.includes(d.codigo_valor));
							} else if (regimenTributario === 'RM') {
								const permitidos = ['01','02','04','07','09','12','13'];
								data = data.filter(d => permitidos.includes(d.codigo_valor));
							}
						} else if (['GMA', 'GCA', 'GPA', 'GTR'].includes(form.alcance)) {
							const permitidos = ['01', '02'];
							data = data.filter(d => permitidos.includes(d.codigo_valor));
						}
						
						setTiposDocumento(data);
					})
					.catch(err => console.error(err));
			} else {
				setTiposDocumento([]);
			}
		}, [form.alcance, regimenTributario]);


		const cargarCatalogos = async () => 
			{
				// Ya no se requiere cargar de BD porque se usan las listas hardcodeadas
			};

		const cargarFormulario = () => 
			{
				if (!documento) 
					{
						setForm(formInicial);
						return;
					}

				setForm({tipo_documento_id: documento.tipo_documento_id || '',
					tipo_documento: documento.tipo_documento || '',
					fecha_inicio: formatearFecha(documento.fecha_inicio) || '',
					fecha_fin: formatearFecha(documento.fecha_fin) || '',
					fecha_vigencia: formatearFecha(documento.fecha_vigencia) || '',
					alcance: documento.alcance || '',
					ruta_documento: documento.ruta_documento || '',
					observaciones: documento.observaciones || ''
				});
			};

		const formatearFecha = (fecha) => 
			{
				if (!fecha) return '';
				if (typeof fecha === 'string') {
					return fecha.split('T')[0];
				}
				return new Date(fecha).toISOString().split('T')[0];
			};

		// Para mostrar en pantalla (modo Consultar), no para inputs de tipo date
		const formatearFechaDisplay = (fecha) => 
			{
				const iso = formatearFecha(fecha);
				if (!iso) return '';

				const [anio, mes, dia] = iso.split('-');
				return `${dia}/${mes}/${anio}`;
			};

		useEffect(() => 
			{
				if (!visible) {return;}

				setErrorMessage('');
				cargarCatalogos();
				if (modo === 'NUEVO') 
					{
						setForm(formInicial);
					}
				else 
					{
						cargarFormulario();
					}
			}, [visible,grupoDocumento,modo,documento]);

		if(!visible){return null;}

		const guardar = async () => 
			{
				setErrorMessage('');
				
				if (!form.alcance || !form.tipo_documento_id || !form.fecha_vigencia || !form.ruta_documento) {
					setErrorMessage('Los primeros 4 campos (Alcance, Tipo Documento, Fecha Vigencia y Ruta Documento) son obligatorios.');
					return;
				}

				// Validation 1: No duplicate document type
				if (modo === 'NUEVO') {
					const existeDoble = documentosExistentes.some(d => d.alcance === form.alcance && d.tipo_documento_id === form.tipo_documento_id && d.estado_documento !== 'INACTIVO');
					if (existeDoble) {
						setErrorMessage('No se permite el doble ingreso de registro para este tipo de documento en esta gestión.');
						return;
					}
				}

				// Validation 2: Fecha de vigencia must be > current date
				const vigenciaStr = form.fecha_vigencia.split('T')[0];
				const currentDate = new Date();
				currentDate.setHours(0, 0, 0, 0);
				
				// Create local date properly without timezone shifting
				const parts = vigenciaStr.split('-');
				const vigenciaDate = new Date(parts[0], parts[1] - 1, parts[2]);
				vigenciaDate.setHours(0, 0, 0, 0);

				if (vigenciaDate <= currentDate) {
					setErrorMessage('No se permite ingreso de documentos con Fecha de vigencia menor o igual a la fecha del sistema.');
					return;
				}

				try 
					{
						const usuario =JSON.parse(localStorage.getItem('usuario'));

						const datosDocumento = {...form,
												proveedor_id: proveedorId,
												grupo_documentos: grupoDocumento,
												fecha_inicio: form.fecha_inicio || null,
												fecha_fin: form.fecha_fin || null,
												create_by: usuario.usuario_id,
												update_by: usuario.usuario_id
												};

						// Guardar descripción del tipo de documento seleccionado
						const tipoSeleccionado = tiposDocumento.find(t => t.codigo_valor === form.tipo_documento_id);
						if (tipoSeleccionado) {
							datosDocumento.descripcion_tipo_documento = tipoSeleccionado.descripcion;
						}

						if (modo === 'NUEVO') 
							{
								await crearDocumento(datosDocumento);
							}
						else 
							{
								await actualizarDocumento(documento.documento_id,datosDocumento);
							}

						alert('Documento registrado correctamente');
						onSuccess();
						cerrarModal();
					}
				catch(error)
					{
						setErrorMessage(error.response?.data?.message ||error.message);
					}
			};

			const GRUPOS_DOCUMENTOS = 
				{    
					DOC_NOR:'GESTION SST - MTA',
					DOC_EXT_NOR:'GESTION DE CALIDAD',
					DOC_REQ_ESTATAL:'GESTION SEG. PATRIMONIAL',
					DOC_OTROS:'GESTION TRANSPORTE'
				};

			const cerrarModal = () => 
				{
					setErrorMessage('');
					setForm({tipo_documento_id:'',
							tipo_documento:'',
							fecha_inicio:'',
							fecha_fin:'',
							fecha_vigencia:'',
							ruta_documento:'',
							observaciones:'',
							alcance:''
							});
					onClose();
				};

			const soloLectura = modo === 'VER';

			const TITULOS = 
				{
					NUEVO:'Nuevo Documento',
					EDITAR:'Editar Documento',
					VER:'Consultar Documento'
				};

			if (modo === 'VER') 
				{
					return (
					
								<div style={styles.overlay}>
									<style>{responsiveCSS}</style>
									<div style={styles.modal}>

										<h2 style={styles.headerTitle}>{TITULOS[modo]}</h2>
										<p style={styles.headerSubtitle}>{GRUPOS_DOCUMENTOS[grupoDocumento]}</p>
										<hr style={styles.divider} />

										<div className="modal-doc-grid" style={styles.grid}>
										
											<div style={styles.field}>
													<label style={styles.label}>Alcance</label>
													<div style={styles.readOnlyValue}>
														{documento.descripcion_alcance || documento.alcance}
													</div>
											</div>

											<div style={styles.field}>
												<label style={styles.label}>Tipo Documento</label>
												<div style={styles.readOnlyValue}>
													{
														documento.tipo_documento ||
														documento.descripcion_tipo_documento ||
														(documento.tipo_documento_id === '01' ? 'Carta de Presentación' : documento.tipo_documento_id === '02' ? 'Otros' : documento.tipo_documento_id)
													}
												</div>
											</div>

											<div style={styles.field}>
												<label style={styles.label}>Estado</label>
												<div style={styles.readOnlyValue}>
													{documento.desc_estado_documento}
												</div>
											</div>

											<div style={styles.field}>
												<label style={styles.label}>Fecha Vigencia</label>
												<div style={styles.readOnlyValue}>
													{formatearFechaDisplay(documento.fecha_vigencia)}
												</div>
											</div>

											<div style={{...styles.field, ...styles.fieldFull}}>
												<label style={styles.label}>Ruta Documento</label>
												<div style={styles.readOnlyValue}>
													{documento.ruta_documento}
												</div>
											</div>

											<div style={{...styles.field, ...styles.fieldFull}}>
												<label style={styles.label}>Observaciones</label>
												<div
													style={{
														...styles.readOnlyValue,
														minHeight: '90px',
														whiteSpace: 'pre-wrap'
													}}
												>
													{documento.observaciones}
												</div>
											</div>
										</div>

										<div style={styles.actions}>
											<button style={styles.btnPrimary} onClick={cerrarModal}>
												Cerrar
											</button>
										</div>
									</div>
								</div>
							);

						}

    return (

        <div style={styles.overlay}>

            <style>{responsiveCSS}</style>

            <div style={styles.modal}>

                <h2 style={styles.headerTitle}>{TITULOS[modo]}</h2>
                <p style={styles.headerSubtitle}>{GRUPOS_DOCUMENTOS[grupoDocumento]}</p>

                <hr style={styles.divider} />

                <div className="modal-doc-grid" style={styles.grid}>
				
					<div style={styles.field}>
						<label style={styles.label}>Alcance *</label>
						<select
							value={form.alcance}
							disabled={soloLectura}
							style={{...styles.input, ...(soloLectura ? styles.inputDisabled : {})}}
							onChange={(e)=>setForm({...form, alcance: e.target.value, tipo_documento_id: '', tipo_documento: ''})}>
							<option value="">Seleccione...</option>
							{
								alcances.map(item => (	<option key={item.codigo_valor} value={item.codigo_valor}>
															{item.descripcion}
														</option>)
											)
							}
						</select>
					</div>

                    <div style={styles.field}>
                        <label style={styles.label}>Tipo Documento *</label>

                        {
                            <select
                                disabled={soloLectura || !form.alcance}
                                value={form.tipo_documento_id}
                                style={{...styles.input, ...(soloLectura || !form.alcance ? styles.inputDisabled : {})}}
                                onChange={(e)=>setForm({...form,tipo_documento_id: e.target.value})}>
                                <option value="">Seleccione</option>
                                {
									tiposDocumento.map(item => (<option key={item.codigo_valor} value={item.codigo_valor}>
																	{item.codigo_valor} - {item.descripcion}
																</option>))
                                }
                            </select>                            
                        }
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Fecha Vigencia *</label>
                        <input
                            type="date"
                            disabled={soloLectura}
                            style={{...styles.input, ...(soloLectura ? styles.inputDisabled : {})}}
                            value={form.fecha_vigencia}
                            onChange={(e)=>
                                setForm({
                                    ...form,
                                    fecha_vigencia: e.target.value
                                })
                            }
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Ruta Documento *</label>
                        <input
                            placeholder="Ruta Documento"
                            disabled={soloLectura}
                            style={{...styles.input, ...(soloLectura ? styles.inputDisabled : {})}}
                            value={form.ruta_documento}
                            onChange={(e)=>
                                setForm({
                                    ...form,
                                    ruta_documento: e.target.value
                                })
                            }
                        />
                    </div>

                    <div style={{...styles.field, ...styles.fieldFull}}>
                        <label style={styles.label}>Observaciones</label>
                        <textarea
                            rows={4}
                            placeholder="Observaciones"
                            disabled={soloLectura}
                            style={{...styles.textarea, ...(soloLectura ? styles.inputDisabled : {})}}
                            value={form.observaciones}
                            onChange={(e)=>
                                setForm({
                                    ...form,
                                    observaciones: e.target.value
                                })
                            }
                        />
                    </div>

                </div>

                <div style={{ ...styles.actions, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					
					<div style={{ flex: 1, marginRight: '16px' }}>
						{errorMessage && (
							<span style={{ color: '#dc2626', fontSize: '13px', fontWeight: '500', lineHeight: '1.2', display: 'block' }}>
								{errorMessage}
							</span>
						)}
					</div>
					
					<div style={{ display: 'flex', gap: '12px' }}>
						{
							modo !== 'VER' && (
								<button style={styles.btnPrimary} onClick={guardar}>
									{modo === 'NUEVO' ? 'Guardar' : 'Actualizar'}
								</button>
							)
						}

						<button style={styles.btnGhost} onClick={cerrarModal}>
							{modo === 'VER' ? 'Cerrar' : 'Cancelar'}
						</button>
					</div>

                </div>

            </div>

        </div>

    );

}
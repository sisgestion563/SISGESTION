import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import {buscarProveedor, obtenerProveedorPorId} from '../services/providers.service';
import {listarPorGrupo} from '../services/documentos.service';
import ModalDocumento from '../components/ModalDocumento';
import {obtenerCatalogo} from '../services/catalogos.service';
import * as XLSX from 'xlsx';


// Paleta tomada del layout general del sistema (sidebar navy + acentos azul/ámbar)
const colors = {
	bg: '#f3f4f6',
	card: '#ffffff',
	border: '#e5e7eb',
	text: '#111827',
	textMuted: '#6b7280',
	primary: '#2563eb',
	primaryHover: '#1d4ed8',
	amber: '#f59e0b',
	amberHover: '#d97706',
	success: '#059669',
	successBg: '#d1fae5',
	danger: '#dc2626',
	dangerBg: '#fee2e2',
};

const styles = {
	card: {
		background: colors.card,
		border: `1px solid ${colors.border}`,
		borderRadius: '12px',
		padding: '24px',
		boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
	},
	title: {
		fontSize: '22px',
		fontWeight: 700,
		color: colors.text,
		margin: '0 0 4px 0',
	},
	subtitle: {
		fontSize: '14px',
		color: colors.textMuted,
		margin: '0 0 20px 0',
	},
	sectionTitle: {
		fontSize: '17px',
		fontWeight: 700,
		color: colors.text,
		margin: '24px 0 16px 0',
	},
	radioRow: {
		display: 'flex',
		gap: '24px',
		marginBottom: '16px',
	},
	radioLabel: {
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
		fontSize: '14px',
		color: colors.text,
		cursor: 'pointer',
	},
	searchRow: {
		display: 'flex',
		gap: '10px',
	},
	input: {
		flex: 1,
		maxWidth: '320px',
		padding: '9px 12px',
		border: `1px solid ${colors.border}`,
		borderRadius: '8px',
		fontSize: '14px',
		color: colors.text,
		outline: 'none',
	},
	btnPrimary: {
		background: colors.primary,
		color: '#fff',
		border: 'none',
		borderRadius: '8px',
		padding: '9px 18px',
		fontSize: '14px',
		fontWeight: 600,
		cursor: 'pointer',
	},
	btnAmber: {
		background: colors.amber,
		color: '#fff',
		border: 'none',
		borderRadius: '8px',
		padding: '9px 18px',
		fontSize: '14px',
		fontWeight: 600,
		cursor: 'pointer',
	},
	btnSuccess: {
		background: colors.success,
		color: '#fff',
		border: 'none',
		borderRadius: '8px',
		padding: '9px 18px',
		fontSize: '14px',
		fontWeight: 600,
		cursor: 'pointer',
	},
	btnGhost: {
		background: '#fff',
		color: colors.text,
		border: `1px solid ${colors.border}`,
		borderRadius: '8px',
		padding: '9px 16px',
		fontSize: '14px',
		fontWeight: 600,
		cursor: 'pointer',
	},
	btnGhostActive: {
		background: colors.primary,
		color: '#fff',
		border: `1px solid ${colors.primary}`,
		borderRadius: '8px',
		padding: '9px 16px',
		fontSize: '14px',
		fontWeight: 600,
		cursor: 'pointer',
	},
	table: {
		width: '100%',
		borderCollapse: 'collapse',
		marginTop: '16px',
	},
	th: {
		textAlign: 'left',
		padding: '12px 16px',
		fontSize: '13px',
		fontWeight: 600,
		color: colors.textMuted,
		borderBottom: `1px solid ${colors.border}`,
		background: '#f9fafb',
	},
	td: {
		padding: '14px 16px',
		fontSize: '14px',
		color: colors.text,
		borderBottom: `1px solid ${colors.border}`,
	},
	badge: (ok) => ({
		display: 'inline-block',
		padding: '4px 12px',
		borderRadius: '999px',
		fontSize: '12px',
		fontWeight: 700,
		background: ok ? colors.successBg : colors.dangerBg,
		color: ok ? colors.success : colors.danger,
	}),
	roleBadge: (color) => ({
		display: 'inline-block',
		padding: '3px 10px',
		borderRadius: '999px',
		fontSize: '11px',
		fontWeight: 700,
		background: color === 'primary' ? '#dbeafe' : color === 'amber' ? '#fef3c7' : '#f3f4f6',
		color: color === 'primary' ? colors.primary : color === 'amber' ? '#b45309' : colors.textMuted,
		marginLeft: '8px',
		verticalAlign: 'middle',
	}),
	infoBlock: {
		marginTop: '20px',
		marginBottom: '20px',
		display: 'grid',
		gap: '6px',
	},
	infoLine: {
		fontSize: '14px',
		color: colors.text,
		margin: 0,
	},
	divider: {
		border: 'none',
		borderTop: `1px solid ${colors.border}`,
		margin: '20px 0',
	},
	tabsRow: {
		display: 'flex',
		gap: '10px',
		marginBottom: '20px',
		flexWrap: 'wrap',
	},
	rowActions: {
		display: 'flex',
		gap: '8px',
	},
	linkBtn: {
		background: colors.primary,
		color: '#fff',
		border: 'none',
		borderRadius: '6px',
		padding: '6px 14px',
		fontSize: '13px',
		fontWeight: 600,
		cursor: 'pointer',
	},
	linkBtnAmber: {
		background: colors.amber,
		color: '#fff',
		border: 'none',
		borderRadius: '6px',
		padding: '6px 14px',
		fontSize: '13px',
		fontWeight: 600,
		cursor: 'pointer',
	},
	infoGrupo: {
        marginTop: '16px',
        marginBottom: '18px',
        padding: '14px 18px',
        minHeight: '70px',
        background: '#F8FAFC',
        border: '1px solid #D8DEE9',
        borderLeft: '5px solid #2563EB',
        borderRadius: '8px',
        color: '#374151',
        fontSize: '14px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap'
    },
	emptyState: {
		padding: '32px 16px',
		textAlign: 'center',
		color: colors.textMuted,
		fontSize: '14px',
	},
	alertInfo: {
		background: '#eff6ff',
		border: '1px solid #bfdbfe',
		borderLeft: '4px solid #2563eb',
		borderRadius: '8px',
		padding: '14px 18px',
		fontSize: '14px',
		color: '#1e40af',
		marginBottom: '20px',
	},
	
};

const responsiveCSS = `
    @media (max-width: 640px) {
        .documentos-card { padding: 16px !important; }
        .documentos-search-row { flex-direction: column; align-items: stretch !important; }
        .documentos-search-row input { max-width: 100% !important; }
    }
    .table-scroll {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
    .table-scroll table {
        min-width: 560px;
    }
`;

// ── Helpers de rol ─────────────────────────────────────────────────────────────
const obtenerUsuario = () => {
	try {
		const raw = localStorage.getItem('usuario');
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
};

export default function DocumentsPage() {
		// ── Identidad del usuario logueado ──────────────────────────────────────
		const usuarioLogueado = obtenerUsuario();
		const rolCodigo       = usuarioLogueado?.rol_codigo || '';
		const esProveedor     = rolCodigo === 'PROVEEDOR';
		const esConsultor     = rolCodigo === 'CONSULTOR';
		const miProveedorId   = usuarioLogueado?.proveedor_id;

		// Solo ADMIN puede agregar/editar; PROVEEDOR puede agregar/editar sus propios docs;
		// CONSULTOR solo puede ver.
		const puedeEscribir = !esConsultor;

		// ── Estado ──────────────────────────────────────────────────────────────
		const [tipoBusqueda,setTipoBusqueda] = useState('RAZON');
		const [valorBusqueda,setValorBusqueda] = useState('');
		const [proveedores,setProveedores] = useState([]);
		const [proveedorSeleccionado,setProveedorSeleccionado] = useState(null);
		const [grupoSeleccionado,setGrupoSeleccionado] = useState('');
		const [documentos,setDocumentos] = useState([]);
		const [grupos,setGrupos] = useState([]);
		const [textoGrupo,setTextoGrupo] = useState('');
		const [cargandoProveedor, setCargandoProveedor] = useState(false);

		const [modalDocumentoVisible,setModalDocumentoVisible] = useState(false);
		const [modoDocumento, setModoDocumento] = useState('NUEVO');
		const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

		// ── Carga catálogo de grupos ─────────────────────────────────────────────
		const cargarGrupos = async () => {
				try {
						const data = await obtenerCatalogo('0005','GRUPO_DOCUMENTO');
						console.log("CATALOGO",data);
						setGrupos(data);

						if(data.length > 0) {
								setGrupoSeleccionado(data[0].codigo_valor);
								setTextoGrupo(data[0].texto_boton);
						}
					}
				catch(error) {
						console.error(error);
					}
			};

		// ── Carga documentos ────────────────────────────────────────────────────
		const cargarDocumentos = async (proveedorId,grupo) => {
				try {
						const data = await listarPorGrupo(proveedorId,grupo);
						console.log("listarPorGrupo",data);
						setDocumentos(data);
					}
				catch(error) {
						console.error(error);
					}
			};

		const exportarExcel = () => {
			if (documentos.length === 0) {
				alert("No hay documentos para exportar");
				return;
			}

			const data = documentos.map(item => ({
				"Alcance": item.descripcion_alcance || '',
				"Tipo Documento": item.descripcion_tipo_documento || item.tipo_documento || item.tipo_documento_id || '',
				"Fecha Vigencia": new Date(item.fecha_vigencia).toLocaleDateString('es-PE'),
				"Estado": item.estado_documento === 'V' ? 'VIGENTE' : 'VENCIDO'
			}));

			const ws = XLSX.utils.json_to_sheet(data);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "Documentos");
			
			XLSX.writeFile(wb, `Documentos_${proveedorSeleccionado?.nro_documento || 'Export'}.xlsx`);
		};

		// ── Búsqueda (solo ADMIN / CONSULTOR) ───────────────────────────────────
		const buscar = async () => {
				try {
						const data = await buscarProveedor(tipoBusqueda,valorBusqueda);
						if(tipoBusqueda === 'DOCUMENTO') {
								setProveedorSeleccionado(data);
								setProveedores([]);
								await cargarDocumentos(data.proveedor_id,grupoSeleccionado);
							}
						else {
								setProveedores(data);
								setProveedorSeleccionado(null);
							}
					}
				catch(error) {
						alert(error.response?.data?.message || error.message);
					}
			};

		// ── Auto-carga para PROVEEDOR ────────────────────────────────────────────
		const cargarDatosProveedor = async () => {
				if (!miProveedorId) return;
				setCargandoProveedor(true);
				try {
						// Usamos obtenerProveedorPorId con el ID interno del proveedor (viene del token JWT)
						const fichaData = await obtenerProveedorPorId(miProveedorId);
						if (fichaData) {
							setProveedorSeleccionado(fichaData);
						}
						await cargarDocumentos(miProveedorId, grupoSeleccionado || grupos[0]?.codigo_valor || '');
					}
				catch(error) {
						console.error("Error cargando datos del proveedor:", error);
					}
				finally {
						setCargandoProveedor(false);
					}
			};

		// ── Efectos iniciales ────────────────────────────────────────────────────
		useEffect(() => {
			cargarGrupos();
		}, []);

		// Una vez que los grupos están listos, si es PROVEEDOR auto-cargamos sus docs
		useEffect(() => {
			if (esProveedor && grupos.length > 0) {
				cargarDatosProveedor();
			}
		}, [esProveedor, grupos]);

		// ── Etiqueta del rol para mostrar en el título ───────────────────────────
		const rolLabel = esProveedor ? 'PROVEEDOR' : esConsultor ? 'CONSULTOR' : 'ADMIN';
		const rolColor = esProveedor ? 'primary' : esConsultor ? 'amber' : 'gray';

		return (
			<MainLayout>
				<style>{responsiveCSS}</style>
				<div className="documentos-card" style={styles.card}>

					<h2 style={styles.title}>
						Documentos
						<span style={styles.roleBadge(rolColor)}>{rolLabel}</span>
					</h2>

					{/* Subtítulo contextual por rol */}
					<p style={styles.subtitle}>
						{esProveedor
							? 'Gestión de sus expedientes documentales. Puede agregar y editar sus propios documentos.'
							: esConsultor
								? 'Consulta de expedientes documentales de proveedores. Acceso de solo lectura.'
								: 'Búsqueda y gestión de expedientes documentales por proveedor.'}
					</p>

					{/* ── Aviso para CONSULTOR ──────────────────────────────────── */}
					{esConsultor && (
						<div style={styles.alertInfo}>
							⚠️ <strong>Modo consulta:</strong> Usted tiene acceso de solo lectura. No puede agregar ni editar documentos.
						</div>
					)}

					{/* ── Aviso sin ficha para PROVEEDOR ───────────────────────── */}
					{esProveedor && !miProveedorId && (
						<div style={styles.emptyState}>
							Por favor, complete su registro de Ficha Informativa en la sección de Proveedores para gestionar sus documentos.
						</div>
					)}

					{/* ── Buscador (solo para ADMIN y CONSULTOR) ───────────────── */}
					{!esProveedor && (
						<>
							<div style={styles.radioRow}>

								<label style={styles.radioLabel}>
									<input type="radio" checked={tipoBusqueda ==='RAZON'} onChange={()=>setTipoBusqueda('RAZON')}/>
									Razón Social
								</label>

								<label style={styles.radioLabel}>
									<input type="radio" checked={tipoBusqueda ==='DOCUMENTO'} onChange={()=>setTipoBusqueda('DOCUMENTO')}/>
									Documento
								</label>

							</div>

							<div className="documentos-search-row" style={styles.searchRow}>
								<input
									style={styles.input}
									value={valorBusqueda}
									onChange={(e)=> setValorBusqueda(e.target.value)}
									placeholder="Valor búsqueda"
									onKeyDown={(e) => e.key === 'Enter' && buscar()}
								/>

								<button style={styles.btnPrimary} onClick={buscar}>Buscar</button>
							</div>
						</>
					)}

					{/* ── Indicador de carga (PROVEEDOR) ───────────────────────── */}
					{esProveedor && cargandoProveedor && (
						<div style={styles.emptyState}>Cargando sus documentos…</div>
					)}

					{/* ── Lista de resultados de búsqueda ──────────────────────── */}
					{
						proveedores.length > 0 &&

						<div className="table-scroll">
						<table style={styles.table}>

							<thead>
								<tr>
									<th style={styles.th}>Nº Documento</th>
									<th style={styles.th}>Razón Social</th>
									<th style={styles.th}>Acción</th>
								</tr>
							</thead>

							<tbody>
								{proveedores.map(item => (
									<tr key={item.proveedor_id}>
										<td style={styles.td}>{item.nro_documento}</td>
										<td style={styles.td}>
											{
												item.razon_social ||
												`${item.nombre || ''} ${item.apellido_paterno || ''} ${item.apellido_materno || ''}`
											}
										</td>
										<td style={styles.td}>
											<button
												style={styles.linkBtn}
												onClick={async ()=>{setProveedorSeleccionado(item);await cargarDocumentos(item.proveedor_id,grupoSeleccionado);}}
											>
												Seleccionar
											</button>
										</td>
									</tr>
								))}
							</tbody>

						</table>
						</div>
					}

					{/* ── Detalle del proveedor + documentos ───────────────────── */}
					{
						proveedorSeleccionado &&

						<>

							<div style={styles.infoBlock}>

								<p style={styles.infoLine}>
									<b>Razón Social:</b>{' '}
									{
										proveedorSeleccionado.razon_social ||
										`${proveedorSeleccionado.nombre || ''} ${proveedorSeleccionado.apellido_paterno || ''} ${proveedorSeleccionado.apellido_materno || ''}`
									}
								</p>

								<p style={styles.infoLine}>
									<b>CIIU:</b>{' '}
									{proveedorSeleccionado.ciiu}
									{' - '}
									{proveedorSeleccionado.descripcion_ciiu}
								</p>

								<p style={styles.infoLine}>
									<b>UBIGEO:</b>{' '}
									{proveedorSeleccionado.ubigeo}
									{' - '}
									{proveedorSeleccionado.departamento}
									{' / '}
									{proveedorSeleccionado.provincia}
									{' / '}
									{proveedorSeleccionado.ciudad}
								</p>

							</div>

							<hr style={styles.divider}/>

							<h3 style={styles.sectionTitle}>
								{esProveedor ? 'Mis Documentos' : 'Documentos del Proveedor'}
							</h3>

							<div style={styles.tabsRow}>

								{grupos.map(g => (
									<button
										key={g.codigo}
										style={grupoSeleccionado === g.codigo_valor ? styles.btnGhostActive : styles.btnGhost}
										onClick={async ()=>{setGrupoSeleccionado(g.codigo_valor);
																		setTextoGrupo(g.texto_boton);
																		await cargarDocumentos(proveedorSeleccionado.proveedor_id,g.codigo_valor);}}>
										{g.descripcion}
									</button>
								))}

							</div>
							
							<div style={styles.infoGrupo}>
								{textoGrupo}
							</div>

							{/* Botón Agregar: solo para ADMIN y PROVEEDOR */}
							<div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
								{puedeEscribir && (
									<button
										style={styles.btnPrimary}
										onClick={() => {
											setDocumentoSeleccionado(null);
											setModoDocumento('NUEVO');
											setModalDocumentoVisible(true);
										}}
									>
										Agregar Documento
									</button>
								)}

								<button
									style={styles.btnSuccess}
									onClick={exportarExcel}
								>
									Exportar Documentos
								</button>
							</div>

							<div className="table-scroll">
							<table style={styles.table}>

								<thead>
									<tr>
										<th style={styles.th}>Alcance</th>
										<th style={styles.th}>Tipo Documento</th>											
										<th style={styles.th}>Fecha Vigencia</th>
										<th style={styles.th}>Estado</th>
										<th style={styles.th}>Acciones</th>
									</tr>
								</thead>

								<tbody>

									{documentos.length === 0 && (
										<tr>
											<td colSpan={5} style={{...styles.td, textAlign:'center', color: colors.textMuted}}>
												No hay documentos registrados en este grupo.
											</td>
										</tr>
									)}

									{documentos.map(item => (

										<tr key={item.documento_id}>
										
											<td style={styles.td}>{item.descripcion_alcance}</td>

											<td style={styles.td}>
												{
													item.descripcion_tipo_documento ||
													item.tipo_documento ||
													item.tipo_documento_id
												}
											</td>

											<td style={styles.td}>
												{new Date(item.fecha_vigencia).toLocaleDateString('es-PE')}
											</td>

											<td style={styles.td}>
												<span style={styles.badge(item.estado_documento === 'V')}>
													{item.estado_documento === 'V' ? 'VIGENTE' : 'VENCIDO'}
												</span>
											</td>

											<td style={styles.td}>
												<div style={styles.rowActions}>

													{/* Botón VER: disponible para todos los roles */}
													<button
														style={styles.linkBtn}
														onClick={() => {
															setDocumentoSeleccionado(item);
															setModoDocumento('VER');
															setModalDocumentoVisible(true);
														}}
													>
														Ver
													</button>

													{/* Botón EDITAR: solo para ADMIN y PROVEEDOR */}
													{puedeEscribir && (
														<button
															style={styles.linkBtnAmber}
															onClick={() => {
																setDocumentoSeleccionado(item);
																setModoDocumento('EDITAR');
																setModalDocumentoVisible(true);
															}}
														>
															Editar
														</button>
													)}

												</div>
											</td>

										</tr>

									))}

								</tbody>

							</table>
							</div>

						</>
					}

					{
						modalDocumentoVisible && (
							<ModalDocumento
								visible={true}
								modo={modoDocumento}
								documento={documentoSeleccionado}
								proveedorId={proveedorSeleccionado?.proveedor_id}
								grupoDocumento={grupoSeleccionado}
								onClose={() => setModalDocumentoVisible(false)}
								onSuccess={async () => {
									await cargarDocumentos(
										proveedorSeleccionado.proveedor_id,
										grupoSeleccionado
									);
								}}
							/>
						)
					}

				</div>
			</MainLayout>
		);
	}

import {useState} from 'react';
import MainLayout from '../layouts/MainLayout';
import {buscarProveedor} from '../services/providers.service';
import {listarPorGrupo} from '../services/documentos.service';
import ModalDocumento from '../components/ModalDocumento';

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

export default function DocumentsPage()
	{
		const [tipoBusqueda,setTipoBusqueda] = useState('DOCUMENTO');
		const [valorBusqueda,setValorBusqueda] = useState('');
		const [proveedores,setProveedores] = useState([]);
		const [proveedorSeleccionado,setProveedorSeleccionado] = useState(null);
		const [grupoSeleccionado,setGrupoSeleccionado] = useState('DOCUMENTOS NORMATIVOS');
		const [documentos,setDocumentos] = useState([]);

		const buscar = async () =>
			{	try
					{
						const data =await buscarProveedor(tipoBusqueda,valorBusqueda);
						if(tipoBusqueda === 'DOCUMENTO')
							{
								setProveedorSeleccionado(data);
								setProveedores([]);
								await cargarDocumentos(data.proveedor_id,grupoSeleccionado);
							}
						else
							{
								setProveedores(data);
								setProveedorSeleccionado(null);
							}
					}
				catch(error)
					{
						alert(error.response?.data?.message ||error.message);
					}
			};

		const cargarDocumentos = async (proveedorId,grupo) =>
			{
				try
					{
						const data =await listarPorGrupo(proveedorId,grupo);
						setDocumentos(data);
					}
				catch(error)
					{
						console.error(error);
					}
			};

		const [modalDocumentoVisible,setModalDocumentoVisible] = useState(false);

		const [modoDocumento, setModoDocumento] = useState('NUEVO');

		const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);


		const grupos = [
			{ codigo:'DOC_NOR', nombre:'Doc. Normativos' },
			{ codigo:'DOC_EXT_NOR', nombre:'Doc. Extra Normativos' },
			{ codigo:'DOC_REQ_ESTATAL', nombre:'Doc. Req. Estatal' },
			{ codigo:'DOC_OTROS', nombre:'Doc. Otros' },
		];

		return (
			<MainLayout>
				<style>{responsiveCSS}</style>
				<div className="documentos-card" style={styles.card}>

					<h2 style={styles.title}>Documentos</h2>

					<div style={styles.radioRow}>

						<label style={styles.radioLabel}>
							<input type="radio" checked={tipoBusqueda ==='DOCUMENTO'} onChange={()=>setTipoBusqueda('DOCUMENTO')}/>
							Documento
						</label>

						<label style={styles.radioLabel}>
							<input type="radio" checked={tipoBusqueda ==='RAZON'} onChange={()=>setTipoBusqueda('RAZON')}/>
							Razón Social
						</label>

					</div>

					<div className="documentos-search-row" style={styles.searchRow}>
						<input
							style={styles.input}
							value={valorBusqueda}
							onChange={(e)=> setValorBusqueda(e.target.value)}
							placeholder="Valor búsqueda"
						/>

						<button style={styles.btnPrimary} onClick={buscar}>Buscar</button>
					</div>

					{
						proveedores.length > 0 &&

						<div className="table-scroll">
						<table style={styles.table}>

							<thead>
								<tr>
									<th style={styles.th}>Documento</th>
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

							<h3 style={styles.sectionTitle}>Documentos del Proveedor</h3>

							<div style={styles.tabsRow}>

								{grupos.map(g => (
									<button
										key={g.codigo}
										style={grupoSeleccionado === g.codigo ? styles.btnGhostActive : styles.btnGhost}
										onClick={async ()=>{
											setGrupoSeleccionado(g.codigo);
											await cargarDocumentos(proveedorSeleccionado.proveedor_id, g.codigo);
										}}
									>
										{g.nombre}
									</button>
								))}

							</div>

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

									{documentos.map(item => (
									
										<td style={styles.td}>{item.descripcion_alcance}</td>

										<tr key={item.documento_id}>)

											<td style={styles.td}>
												{
													item.descripcion_tipo_documento ||
													item.tipo_documento ||
													item.tipo_documento_id
												}
											</td>

											<td style={styles.td}>{item.descripcion_alcance}</td>

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

const repository = require('../repositories/documentos.repository');
const {calcularEstadoDocumento} = require('../utils/documento.utils');

const listarPorProveedor = async (proveedorId) =>
	{
		return await repository.listarPorProveedor(proveedorId);
	};

const obtenerPorId = async (documentoId) =>
	{
		return await repository.obtenerPorId(documentoId);
	};

const crear = async (documento) => 
	{
		if (!documento.grupo_documentos)
			{
				throw new Error('Grupo Documento es obligatorio');
			}

		if (!documento.fecha_vigencia) 
			{
				throw new Error('Fecha Vigencia es obligatoria');
			}

		if (documento.alcance === 'GMA') {
			const existing = await repository.listarPorProveedor(documento.proveedor_id);
			const countGMA = existing.filter(d => d.alcance === 'GMA').length;
			if (countGMA >= 2) {
				throw new Error('Solo se permite ingresar un máximo de 2 documentos para la Gestión MA.');
			}
		}

		switch(documento.grupo_documentos)
			{        
				case 'DOC_NOR':
					if (documento.alcance != 'GSG' && documento.alcance != 'GMA')
						{
							throw new Error('Alcance NO permitido en este Grupo de Documentos. Solo puede seleccionar "Gestión SST y/o Gestión Ambiental" para el campo ALCANCE');
						}
				
				
					if(documento.tipo_documento_id === null )
						{
							throw new Error('Tipo Documento es obligatorio');
						}
					break;
					
				case 'DOC_EXT_NOR':
					if (documento.alcance === 'GSG' || documento.alcance === 'GMA' || documento.alcance === 'GPA' || documento.alcance === 'GTR')
						{
							throw new Error('Alcance NO permitido en este Grupo de Documentos. Solo puede seleccionar "Gestion de Calidad" para el campo ALCANCE');
						}
						
					if(documento.tipo_documento_id === null )
						{
							throw new Error('Tipo Documento es obligatorio');
						}						
					break;
				
				
				case 'DOC_REQ_ESTATAL':
					if (documento.alcance === 'GSG' || documento.alcance === 'GMA' || documento.alcance === 'GCA' || documento.alcance === 'GTR')
						{
							throw new Error('Alcance NO permitido en este Grupo de Documentos. Solo puede seleccionar "Gestión Patrimonial" para el campo ALCANCE');
						}
						
					
					if(documento.tipo_documento_id === null )
						{
							throw new Error('Tipo Documento es obligatorio');
						}
					break;
				
				
				
				case 'DOC_OTROS':
				
					if (documento.alcance === 'GSG' || documento.alcance === 'GMA' || documento.alcance === 'GCA' || documento.alcance === 'GPA')
						{
							throw new Error('Alcance NO permitido en este Grupo de Documentos. Solo puede seleccionar "Gestión Ética" para el campo ALCANCE');
						}
						
					
					if(documento.tipo_documento_id === null )
						{
							throw new Error('Tipo Documento es obligatorio');
						}
					break;
			}

		documento.estado_documento = calcularEstadoDocumento(documento.fecha_vigencia);
		return await repository.crear(documento);
	};

const actualizar = async (documentoId,documento) => 
	{
		if (!documento.alcance)
			{
				throw new Error('El Alcance es obligatorio');
			}
			
			
		if (!documento.fecha_vigencia) 
			{
				throw new Error('Fecha Vigencia es obligatoria');
			}

		if (documento.alcance === 'GMA') {
			const existingDoc = await repository.obtenerPorId(documentoId);
			const proveedorId = documento.proveedor_id || existingDoc.proveedor_id;
			const existing = await repository.listarPorProveedor(proveedorId);
			const countGMA = existing.filter(d => d.alcance === 'GMA' && String(d.documento_id) !== String(documentoId)).length;
			if (countGMA >= 2) {
				throw new Error('Solo se permite ingresar un máximo de 2 documentos para la Gestión MA.');
			}
		}

		switch(documento.grupo_documentos)
			{        
				case 'DOC_NOR':
					if (documento.alcance != 'GSG' && documento.alcance != 'GMA')
						{
							throw new Error('Alcance NO permitido en este Grupo de Documentos. Solo puede seleccionar "Gestión SST y/o Gestión Ambiental" para el campo ALCANCE');
						}
				
				
					if(documento.tipo_documento_id === null )
						{
							throw new Error('Tipo Documento es obligatorio');
						}
					break;
					
				case 'DOC_EXT_NOR':
					if (documento.alcance === 'GSG' || documento.alcance === 'GMA' || documento.alcance === 'GPA' || documento.alcance === 'GTR')
						{
							throw new Error('Alcance NO permitido en este Grupo de Documentos. Solo puede seleccionar "Gestion de Calidad" para el campo ALCANCE');
						}
						
					if(documento.tipo_documento_id === null )
						{
							throw new Error('Tipo Documento es obligatorio');
						}						
					break;
				
				
				case 'DOC_REQ_ESTATAL':
					if (documento.alcance === 'GSG' || documento.alcance === 'GMA' || documento.alcance === 'GCA' || documento.alcance === 'GTR')
						{
							throw new Error('Alcance NO permitido en este Grupo de Documentos. Solo puede seleccionar "Gestión Patrimonial" para el campo ALCANCE');
						}
						
					
					if(documento.tipo_documento_id === null )
						{
							throw new Error('Tipo Documento es obligatorio');
						}
					break;
				
				
				
				case 'DOC_OTROS':
				
					if (documento.alcance === 'GSG' || documento.alcance === 'GMA' || documento.alcance === 'GCA' || documento.alcance === 'GPA')
						{
							throw new Error('Alcance NO permitido en este Grupo de Documentos. Solo puede seleccionar "Gestión Ética" para el campo ALCANCE');
						}
						
					
					if(documento.tipo_documento_id === null )
						{
							throw new Error('Tipo Documento es obligatorio');
						}
					break;
			}	
			
		documento.estado_documento =calcularEstadoDocumento(documento.fecha_vigencia);
		await repository.actualizar(documentoId,documento);

	};

const listarPorGrupo = async (proveedorId,grupo) =>
	{
		return await repository.listarPorGrupo(proveedorId,grupo);
	};

module.exports = {	listarPorProveedor,
					obtenerPorId,
					crear,
					actualizar,
					listarPorGrupo};
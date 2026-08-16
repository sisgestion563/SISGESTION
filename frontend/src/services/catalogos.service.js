import api from './api';

export const obtenerCatalogo = async (codGrupo,tipoGrupo) =>
	{
		const token = localStorage.getItem('token');
		const response = await api.get(`/catalogos/${codGrupo}/${tipoGrupo}`,{headers:{Authorization:`Bearer ${token}`}});
		return response.data.data;
	};

export const obtenerPeriodos = async () =>
	{
		const token = localStorage.getItem('token');
		const response = await api.get('/catalogos/periodos',{headers:{Authorization:`Bearer ${token}`}});
		return response.data.data;
	};

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

export default function EditPostForm({ onPostUpdated }) {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true); 
    const [submitLoading, setSubmitLoading] = useState(false); 
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const API_URL = 'http://localhost:8000/api';

    useEffect(() => {
        const fetchPost = async () => {
            if (!token || !user) {
                setError('No autorizado. Por favor, inicia sesión.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}` 
                    }
                };
                const response = await axios.get(`${API_URL}/posts/${id}`, config);
                const postData = response.data;

                
                
                const isOwner = postData.owner && postData.owner._id === user.id; 
                const isAdmin = user.role === 'admin';

                if (!isOwner && !isAdmin) {
                    setError('No tienes permiso para editar este post.');
                    setLoading(false);
                    return;
                }

                setTitle(postData.title);
                setContent(postData.content);

            } catch (err) {
                console.error('Error al obtener el post para editar:', err);
                if (err.response) {
                    if (err.response.status === 401 || err.response.status === 403) {
                        setError('No autorizado o no tienes permisos para ver/editar este post.');
                    } else if (err.response.status === 404) {
                        setError('Post no encontrado.');
                    } else {
                        setError(err.response.data.message || 'Error al cargar el post para editar.');
                    }
                } else if (err.request) {
                    setError('No se pudo conectar con el servidor para obtener el post.');
                } else {
                    setError('Ocurrió un error inesperado al cargar el post.');
                }
            } finally {
                setLoading(false);
            }
        };

        
        if (id && token && user) {
            fetchPost();
        } else if (!token || !user) { 
            setLoading(false);
            setError('Debes iniciar sesión para editar posts.');
        }
    }, [id, token, user, navigate]); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError(null);
        setSuccessMessage(null);

        
        if (!token || !user) {
            setError('No estás autenticado. Por favor, inicia sesión.');
            setSubmitLoading(false);
            return;
        }
       

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.put(`${API_URL}/posts/${id}`, { title, content }, config);

            console.log('Post actualizado exitosamente:', response.data);
            setSuccessMessage(response.data.message || 'Post actualizado con éxito.');

            if (onPostUpdated) {
                onPostUpdated(response.data.post);
            }
            navigate('/'); 

        } catch (err) {
            console.error('Error al actualizar el post:', err);
            if (err.response) {
                setError(err.response.data.message || 'Error al actualizar el post.');
            } else if (err.request) {
                setError('No se pudo conectar con el servidor para actualizar el post.');
            } else {
                setError('Ocurrió un error inesperado al actualizar el post.');
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return <p>Cargando post para editar...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div style={{ margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '500px' }}>
            <h2>Editar Post</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="editPostTitle" style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
                    <input
                        type="text"
                        id="editPostTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="editPostContent" style={{ display: 'block', marginBottom: '5px' }}>Contenido:</label>
                    <textarea
                        id="editPostContent"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows="6"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    ></textarea>
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

                <button
                    type="submit"
                    disabled={submitLoading}
                    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    {submitLoading ? 'Actualizando Post...' : 'Actualizar Post'}
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/')} 
                    style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Cancelar
                </button>
            </form>
        </div>
    );
}
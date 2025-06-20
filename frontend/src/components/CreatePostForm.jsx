
import React, { useState } from 'react';
import axios from 'axios';

export default function CreatePostForm({ onPostCreated }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const API_URL = 'http://localhost:8000/api';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

       
        const token = localStorage.getItem('token');

        if (!token) {
            setError('No estás autenticado. Por favor, inicia sesión para crear un post.');
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                }
            };

            const response = await axios.post(`${API_URL}/posts`, { title, content }, config);

            console.log('Post creado exitosamente:', response.data);
            setSuccessMessage(response.data.message || 'Post creado con éxito.');
            setTitle('');
            setContent(''); 

            
            if (onPostCreated) {
                onPostCreated(response.data.post);
            }

        } catch (err) {
            console.error('Error al crear el post:', err);
            if (err.response) {
                setError(err.response.data.message || 'Error al crear el post.');
            } else if (err.request) {
                setError('No se pudo conectar con el servidor para crear el post.');
            } else {
                setError('Ocurrió un error inesperado al crear el post.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '500px' }}>
            <h2>Crear Nuevo Post</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="postTitle" style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
                    <input
                        type="text"
                        id="postTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="postContent" style={{ display: 'block', marginBottom: '5px' }}>Contenido:</label>
                    <textarea
                        id="postContent"
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
                    disabled={loading}
                    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    {loading ? 'Creando Post...' : 'Crear Post'}
                </button>
            </form>
        </div>
    );
}
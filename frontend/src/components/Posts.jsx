
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Post.css';

export default function PostList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { isAuthenticated, token, user } = useAuth();

    const API_URL = 'http://localhost:8000/api';

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            const config = {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            };

            const response = await axios.get(`${API_URL}/posts`, config);
            setPosts(response.data);
        } catch (err) {
            console.error('Error al obtener los posts:', err);
            if (err.response) {
                setError(err.response.data.message || 'Error al cargar los posts.');
            } else if (err.request) {
                setError('No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
            } else {
                setError('Ocurrió un error inesperado al cargar los posts.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [token]);

    const handleDelete = async (postId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
            return;
        }

        if (!isAuthenticated || !token) {
            setError('Debes iniciar sesión para eliminar posts.');
            return;
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.delete(`${API_URL}/posts/${postId}`, config);
            alert('Post eliminado exitosamente.');
            setPosts(posts.filter(post => post._id !== postId));
        } catch (err) {
            console.error('Error al eliminar el post:', err);
            setError(err.response?.data?.message || 'Error al eliminar el post.');
        }
    };

    if (loading) {
        return <p className="loading-message">Cargando posts...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="post-list-container">
            {}

            <div className="post-list-header">
                <h2 className="post-list-title">Últimos Posts</h2>
                {}
            </div>

            {posts.length === 0 ? (
                <p>No hay posts disponibles. ¡Sé el primero en publicar!</p>
            ) : (
                <ul className="post-list">
                    {posts.map(post => (
                        <li key={post._id} className="post-list-item">
                            <Link to={`/posts/${post._id}`} className="post-link">
                                <h3 className="post-title">{post.title}</h3>
                                <p className="post-excerpt">{post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}</p>
                            </Link>
                            <div className="post-meta">
                                <span className="post-author">Autor: {post.owner ? post.owner.username : 'Desconocido'}</span>
                            </div>

                            {isAuthenticated && user && (user.id === post.owner?._id || user.role === 'admin') && (
                                <div className="post-actions">
                                    <button
                                        onClick={() => alert(`Editar post con ID: ${post._id}`)}
                                        className="edit-button"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post._id)}
                                        className="delete-button"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {}
        </div>
    );
}
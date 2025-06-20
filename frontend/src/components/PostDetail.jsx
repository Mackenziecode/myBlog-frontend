
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/PostDetail.css';

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, isAuthenticated, user } = useAuth();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newCommentContent, setNewCommentContent] = useState('');

    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);

    const [error, setError] = useState(null);
    const [commentError, setCommentError] = useState(null); 

    const API_URL = 'http://localhost:8000/api';

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);

                const config = {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                };

                const response = await axios.get(`${API_URL}/posts/${id}`, config);
                setPost(response.data);
            } catch (err) {
                console.error('Error al obtener el detalle del post:', err);
                if (err.response) {
                    if (err.response.status === 404) {
                        setError('Post no encontrado.');
                    } else if (err.response.status === 401 || err.response.status === 403) {
                         setError('No autorizado para ver este post. Por favor, inicia sesión.');
                    }
                    else {
                        setError(err.response.data.message || 'Error al cargar el post.');
                    }
                } else if (err.request) {
                    setError('No se pudo conectar con el servidor.');
                } else {
                    setError('Ocurrió un error inesperado.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
        } else {
            setError('ID de post no proporcionado.');
            setLoading(false);
        }
    }, [id, token]);

    const fetchComments = async () => {
        setCommentLoading(true);
        setCommentError(null);
        try {
            const response = await axios.get(`${API_URL}/comments/${id}`);
            setComments(response.data);
        } catch (err) {
            console.error('Error al obtener los comentarios:', err);
            setCommentError(err.response?.data?.message || 'Error al cargar los comentarios.');
        } finally {
            setCommentLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchComments();
        }
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setCommentLoading(true);
        setCommentError(null);

        if (!newCommentContent.trim()) {
            setCommentError('El comentario no puede estar vacío.');
            setCommentLoading(false);
            return;
        }

        if (!isAuthenticated || !token) {
            setCommentError('Debes iniciar sesión para comentar.');
            setCommentLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            const response = await axios.post(`${API_URL}/comments/${id}`, { content: newCommentContent }, config);
            console.log('Comentario añadido:', response.data.comment);
            setNewCommentContent('');
            fetchComments();
        } catch (err) {
            console.error('Error al añadir comentario:', err);
            setCommentError(err.response?.data?.message || 'Error al añadir el comentario.');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
            return;
        }

        setCommentLoading(true);
        setCommentError(null);

        if (!isAuthenticated || !token) {
            setCommentError('Debes iniciar sesión para eliminar comentarios.');
            setCommentLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.delete(`${API_URL}/comments/${commentId}`, config);
            
            fetchComments();
        } catch (err) {
            console.error('Error al eliminar comentario:', err);
            setCommentError(err.response?.data?.message || 'Error al eliminar el comentario.');
        } finally {
            setCommentLoading(false);
        }
    };

    if (loading) {
        return <p>Cargando post...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!post) {
        return <p>El post no está disponible.</p>;
    }

    return (
        <div className="post-detail-container">
            <h2 className="post-detail-title">{post.title}</h2>
            <p className="post-detail-author">Autor: {post.owner ? post.owner.username : 'Desconocido'}</p>
            <div className="post-detail-content">{post.content}</div>

            <div>
                <button
                    onClick={() => navigate('/')}
                    className="back-button"
                >
                    Volver a la lista de Posts
                </button>
            </div>

            <hr className="comment-section-divider" />

            <div style={{ marginTop: '30px' }}>
                <h3 className="comment-list-title">Comentarios ({comments.length})</h3>

                {commentLoading && <p>Cargando comentarios...</p>}
                {}

                {comments.length === 0 && !commentLoading && (
                    <p>Sé el primero en comentar este post.</p>
                )}

                {comments.map(comment => (
                    <div key={comment._id} className="comment-item">
                        <p><strong>{comment.owner ? comment.owner.username : 'Usuario Desconocido'}</strong>: {comment.content}</p>
                        <small>{new Date(comment.createdAt).toLocaleString()}</small>
                        {user && (comment.owner && user.id === comment.owner._id || user.role === 'admin') && (
                            <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="delete-comment-button"
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                ))}

                <div className="comment-form-section">
                    <h4>Añadir un comentario</h4>
                    {isAuthenticated ? (
                        <form onSubmit={handleCommentSubmit}>
                            <textarea
                                value={newCommentContent}
                                onChange={(e) => setNewCommentContent(e.target.value)}
                                placeholder="Escribe tu comentario aquí..."
                                rows="4"
                                className="comment-textarea"
                                required
                            ></textarea>
                            <button
                                type="submit"
                                disabled={commentLoading}
                                className="submit-comment-button"
                            >
                                {commentLoading ? 'Enviando...' : 'Comentar'}
                            </button>
                        </form>
                    ) : (
                        <p className="login-message">Debes <a href="/login">iniciar sesión</a> para añadir un comentario.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
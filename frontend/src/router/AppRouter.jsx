
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import PostList from '../components/Posts'; 
import CreatePostForm from '../components/CreatePostForm';
import EditPostForm from '../components/EditPostForm';
import PostDetail from '../components/PostDetail'; 
import { useAuth } from '../context/AuthContext'; 


const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />; 
    }
    return children;
};

export default function AppRouter() {
    const { isAuthenticated, user, logout } = useAuth();
    const [refreshPosts, setRefreshPosts] = React.useState(false); 

    
    const handleContentChange = () => {
        setRefreshPosts(prev => !prev);
    };

   
    const isAdmin = isAuthenticated && user && user.role === 'admin';

    return (
        <Router>
            {}
            <nav style={{ padding: '10px 20px', background: '#f8f8f8', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Link to="/" style={{ margin: '0 10px', textDecoration: 'none', color: '#007bff' }}>Inicio</Link>
                    {}
                    {isAdmin && (
                        <Link to="/create-post" style={{ margin: '0 10px', textDecoration: 'none', color: '#007bff' }}>Crear Post</Link>
                    )}
                </div>
                <div>
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" style={{ margin: '0 10px', textDecoration: 'none', color: '#28a745' }}>Login</Link>
                            <Link to="/register" style={{ margin: '0 10px', textDecoration: 'none', color: '#ffc107' }}>Registro</Link>
                        </>
                    ) : (
                        <>
                            <span style={{ margin: '0 10px', color: '#666' }}>Hola, {user.username}!</span>
                            <button onClick={logout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {}
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <Routes>
                    
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    
                    <Route path="/" element={<PostList refreshTrigger={refreshPosts} />} />

                   
                    <Route path="/posts/:id" element={<PostDetail />} /> 
                   
                    <Route
                        path="/create-post"
                        element={
                            <ProtectedRoute>
                                {isAdmin ? (
                                    <CreatePostForm onPostCreated={handleContentChange} />
                                ) : (
                                    <p style={{ color: 'red' }}>Acceso denegado. Solo los administradores pueden crear posts.</p>
                                )}
                            </ProtectedRoute>
                        }
                    />

                    
                    <Route
                        path="/edit-post/:id"
                        element={
                            <ProtectedRoute>
                                <EditPostForm onPostUpdated={handleContentChange} />
                            </ProtectedRoute>
                        }
                    />

                   
                    <Route path="*" element={<p>404: Página no encontrada</p>} />
                </Routes>
            </div>
        </Router>
    );
}
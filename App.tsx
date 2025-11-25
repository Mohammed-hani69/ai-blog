import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PublicBlog } from './components/PublicBlog';
import { SinglePost } from './components/SinglePost';
import { Login } from './components/Login';
import { AIStatusTerminal } from './components/AIStatusTerminal';
import { ManualEditor } from './components/ManualEditor';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { DashboardHome } from './components/DashboardHome';
import { CategoryPage } from './components/CategoryPage';
import { AdSettingsPanel } from './components/AdSettingsPanel';
import { AIControlPanel } from './components/AIControlPanel';
import { AdminProfilePanel } from './components/AdminProfile';
import { BlogPost, AISettings, LogEntry, AIState, Comment, AdSettings, AdminProfile } from './types';
import * as GeminiService from './services/geminiService';

// Error Boundary Component
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center" dir="rtl">
          <div className="max-w-md bg-white p-8 rounded-xl shadow-xl">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">عذراً، حدث خطأ غير متوقع</h2>
            <p className="text-slate-500 mb-6">واجه التطبيق مشكلة أثناء العرض. يرجى تحديث الصفحة.</p>
            <pre className="text-xs bg-slate-100 p-2 rounded text-left dir-ltr overflow-auto mb-4 max-h-32">
              {this.state.error?.toString()}
            </pre>
            <button onClick={() => window.location.href = '/'} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              العودة للرئيسية
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const initialSettings: AISettings = {
  niche: 'الذكاء الاصطناعي',
  keywords: 'تعلم الآلة، الأتمتة، تقنيات المستقبل',
  articlesPerDay: 3,
  imageQuality: '1K',
  language: 'Arabic',
  autoPublish: true,
};

const initialAdSettings: AdSettings = {
  header: { enabled: false, code: '' },
  sidebar: { enabled: false, code: '' },
  articleTop: { enabled: false, code: '' },
  articleMiddle: { enabled: false, code: '' },
  articleBottom: { enabled: false, code: '' },
  footer: { enabled: false, code: '' },
  adsTxtContent: '',
};

const initialAdminProfile: AdminProfile = {
  name: 'المدير العام',
  email: 'admin@mazadplus.com',
  password: 'admin',
};

// Sample Data
const SAMPLE_POSTS: BlogPost[] = [
  {
    id: '101',
    title: 'مستقبل الذكاء الاصطناعي في عام 2025',
    excerpt: 'نظرة شاملة على التطورات المتوقعة في عالم الذكاء الاصطناعي وكيف ستؤثر على حياتنا اليومية.',
    content: '<p>يشهد العالم تطوراً متسارعاً في مجالات الذكاء الاصطناعي...</p><p>هذا المقال يستعرض أهم التوقعات.</p>',
    imageUrl: 'https://picsum.photos/seed/ai1/800/450',
    author: 'الذكاء الاصطناعي',
    date: '2024/10/05',
    tags: ['AI', 'مستقبل', 'تكنولوجيا'],
    category: 'الذكاء الاصطناعي',
    status: 'published',
    views: 1250,
    comments: [
      { id: 'c1', author: 'أحمد محمد', content: 'مقال رائع جداً، شكراً على المعلومات', date: '2024/10/06', replies: [] },
      { id: 'c2', author: 'سارة علي', content: 'أتفق مع النقاط المطروحة بخصوص الأتمتة', date: '2024/10/06', replies: [] }
    ],
    trafficSources: { search: 800, social: 300, direct: 100, referral: 50 }
  },
  {
    id: '102',
    title: 'أفضل لغات البرمجة للتعلم هذا العام',
    excerpt: 'دليل شامل للمبتدئين والمحترفين حول أكثر لغات البرمجة طلباً في سوق العمل.',
    content: '<p>في ظل الطلب المتزايد على المطورين، تبرز لغات مثل Python و JavaScript...</p>',
    imageUrl: 'https://picsum.photos/seed/code2/800/450',
    author: 'المحرر التقني',
    date: '2024/10/08',
    tags: ['برمجة', 'تطوير', 'تعليم'],
    category: 'التكنولوجيا',
    status: 'published',
    views: 890,
    comments: [],
    trafficSources: { search: 600, social: 100, direct: 150, referral: 40 }
  },
  {
    id: '103',
    title: 'تأثير العمل عن بعد على الاقتصاد العالمي',
    excerpt: 'تحليل اقتصادي معمق حول التحولات الجذرية في بيئات العمل وتأثيرها المباشر.',
    content: '<p>لقد غير العمل عن بعد وجه الاقتصاد الحديث...</p>',
    imageUrl: 'https://picsum.photos/seed/eco3/800/450',
    author: 'الذكاء الاصطناعي',
    date: '2024/10/10',
    tags: ['اقتصاد', 'عمل', 'إدارة'],
    category: 'الاقتصاد',
    status: 'published',
    views: 2100,
    comments: [
       { id: 'c3', author: 'مدير تنفيذي', content: 'تحليل دقيق للواقع الحالي', date: '2024/10/11', replies: [] }
    ],
    trafficSources: { search: 1200, social: 600, direct: 200, referral: 100 }
  }
];

function AppContent() {
  // Routing State
  // Check URL path initially
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Content State
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState('dashboard');

  // App Data - Initialize from LocalStorage
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    try {
      const savedPosts = localStorage.getItem('mazadplus_posts');
      if (savedPosts) {
        const parsed: BlogPost[] = JSON.parse(savedPosts);
        return parsed.map(p => ({
            ...p,
            comments: p.comments.map(c => ({...c, replies: c.replies || []})),
            trafficSources: p.trafficSources || { search: 0, social: 0, direct: 0, referral: 0 }
        }));
      }
      return SAMPLE_POSTS;
    } catch (e) {
      return SAMPLE_POSTS;
    }
  });

  const [settings, setSettings] = useState<AISettings>(initialSettings);
  const [adSettings, setAdSettings] = useState<AdSettings>(() => {
    try {
      const savedAds = localStorage.getItem('mazadplus_ads');
      return savedAds ? { ...initialAdSettings, ...JSON.parse(savedAds) } : initialAdSettings;
    } catch (e) {
      return initialAdSettings;
    }
  });

  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => {
    try {
      const savedProfile = localStorage.getItem('mazadplus_admin_profile');
      return savedProfile ? JSON.parse(savedProfile) : initialAdminProfile;
    } catch (e) {
      return initialAdminProfile;
    }
  });
  
  // AI State
  const [aiState, setAiState] = useState<AIState>(AIState.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('mazadplus_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('mazadplus_ads', JSON.stringify(adSettings));
  }, [adSettings]);

  useEffect(() => {
    localStorage.setItem('mazadplus_admin_profile', JSON.stringify(adminProfile));
  }, [adminProfile]);

  // Router logic
  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToCategory = (category: string) => {
    setSelectedCategory(category);
    navigate('/category');
  };

  // View Single Post Handler
  const handleViewPost = (post: BlogPost) => {
    const rand = Math.random();
    let source: keyof BlogPost['trafficSources'] = 'direct';
    if (rand < 0.50) source = 'search'; 
    else if (rand < 0.80) source = 'social'; 
    else if (rand < 0.90) source = 'referral'; 

    const updatedPosts = posts.map(p => 
      p.id === post.id ? { 
          ...p, 
          views: p.views + 1,
          trafficSources: {
              ...p.trafficSources,
              [source]: (p.trafficSources[source] || 0) + 1
          }
      } : p
    );
    setPosts(updatedPosts);
    
    const updatedPost = updatedPosts.find(p => p.id === post.id);
    if (updatedPost) {
      setSelectedPost(updatedPost);
      navigate('/post');
    }
  };

  // Handle Adding Root Comment
  const handleAddComment = (postId: string, author: string, content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author,
      content,
      date: new Date().toLocaleDateString('ar-EG'),
      replies: []
    };

    setPosts(prevPosts => {
      const updated = prevPosts.map(p => 
        p.id === postId ? { ...p, comments: [newComment, ...p.comments] } : p
      );
      return updated;
    });

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prev => prev ? ({
        ...prev,
        comments: [newComment, ...prev.comments]
      }) : null);
    }
  };

  // Handle Reply to Comment
  const handleReplyComment = (postId: string, parentCommentId: string, author: string, content: string) => {
    const newReply: Comment = {
      id: Date.now().toString(),
      author,
      content,
      date: new Date().toLocaleDateString('ar-EG'),
      replies: []
    };

    const addReplyRecursively = (comments: Comment[]): Comment[] => {
        return comments.map(c => {
            if (c.id === parentCommentId) {
                return { ...c, replies: [...(c.replies || []), newReply] };
            }
            if (c.replies && c.replies.length > 0) {
                return { ...c, replies: addReplyRecursively(c.replies) };
            }
            return c;
        });
    };

    setPosts(prevPosts => {
      const updated = prevPosts.map(p => 
        p.id === postId ? { ...p, comments: addReplyRecursively(p.comments) } : p
      );
      return updated;
    });

    if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => {
            if(!prev) return null;
            return {
                ...prev,
                comments: addReplyRecursively(prev.comments)
            }
        });
    }
  };

  // Helper to add log
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev, { timestamp: now, message, type }]);
  };

  // AI Agent Logic
  const runAIAgent = async () => {
    if (aiState !== AIState.IDLE && aiState !== AIState.COMPLETE && aiState !== AIState.ERROR) return;

    setAiState(AIState.ANALYZING_TRENDS);
    addLog('بدء دورة الطيار الآلي...', 'system');
    addLog(`تحليل تريندات Google Search للمجال: ${settings.niche}`);

    try {
      // 1. Trend Analysis
      const { topic, analysis } = await GeminiService.analyzeTrendsAndPickTopic(settings);
      addLog(`تم تحديد الموضوع: ${topic}`, 'success');
      addLog(`تحليل التريند: ${analysis}`, 'info');

      // 2. Writing Content
      setAiState(AIState.WRITING_CONTENT);
      addLog('جاري كتابة المقال (Gemini 2.5 Flash)...', 'system');
      const article = await GeminiService.generateArticleContent(topic, settings);
      addLog('تم إنشاء المحتوى النصي بنجاح.', 'success');

      // 3. Generating Image
      setAiState(AIState.GENERATING_IMAGE);
      addLog('جاري توليد الصورة الحصرية (Gemini 3 Pro Image / Nano Banana)...', 'system');
      let imageUrl = 'https://picsum.photos/800/450'; // Fallback
      try {
         imageUrl = await GeminiService.generateBlogImage(article.imagePrompt, settings.imageQuality);
         addLog('تم توليد صورة عالية الدقة بنجاح.', 'success');
      } catch (imgError) {
         addLog('فشل توليد الصورة، استخدام صورة احتياطية.', 'error');
         console.error(imgError);
      }

      // 4. Publishing
      setAiState(AIState.PUBLISHING);
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        imageUrl: imageUrl,
        author: 'AutoBlog AI',
        date: new Date().toLocaleDateString('ar-EG'),
        tags: article.tags,
        category: article.category,
        status: settings.autoPublish ? 'published' : 'draft',
        views: 0,
        comments: [],
        trafficSources: { search: 0, social: 0, direct: 0, referral: 0 }
      };

      setPosts(prev => [newPost, ...prev]);
      addLog(`تم نشر المقال: "${newPost.title}"`, 'success');
      
      setAiState(AIState.COMPLETE);
      setTimeout(() => setAiState(AIState.IDLE), 5000);

    } catch (error: any) {
      console.error(error);
      addLog(`حدث خطأ: ${error.message}`, 'error');
      setAiState(AIState.ERROR);
    }
  };

  // Manual Publish Handler
  const handleManualPublish = (title: string, content: string, category: string) => {
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: title || "مقال جديد (بدون عنوان)",
      excerpt: content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...",
      content: content,
      imageUrl: 'https://picsum.photos/800/450', 
      author: 'المحرر اليدوي',
      date: new Date().toLocaleDateString('ar-EG'),
      tags: ['يدوي', category],
      category: category,
      status: 'published',
      views: 0,
      comments: [],
      trafficSources: { search: 0, social: 0, direct: 0, referral: 0 }
    };

    setPosts(prev => [newPost, ...prev]);
    addLog(`تم نشر المقال اليدوي بنجاح: ${newPost.title}`, 'success');
    setActiveTab('dashboard');
  };

  // --- Views ---
  
  // 1. Login
  if (currentPath === '/login') {
    return <Login 
      onLogin={() => { setIsAuthenticated(true); navigate('/dashboard'); }} 
      onBack={() => navigate('/')} 
      adminProfile={adminProfile}
    />;
  }

  // 2. Dashboard
  if (currentPath === '/dashboard') {
    if (!isAuthenticated) {
      return <Login onLogin={() => { setIsAuthenticated(true); navigate('/dashboard'); }} onBack={() => navigate('/')} adminProfile={adminProfile} />;
    }
    return (
      <DashboardLayout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => { setIsAuthenticated(false); navigate('/'); }}
        adminProfile={adminProfile}
      >
        {activeTab === 'dashboard' && <DashboardHome posts={posts} aiState={aiState} logs={logs} onNavigate={setActiveTab} />}
        {activeTab === 'analytics' && <AnalyticsDashboard posts={posts} />}
        {activeTab === 'ads' && <AdSettingsPanel settings={adSettings} onSave={setAdSettings} />}
        {activeTab === 'ai-control' && (
           <AIControlPanel 
              settings={settings} 
              onSettingsChange={setSettings} 
              onStartAI={runAIAgent} 
              aiState={aiState} 
              logs={logs} 
           />
        )}
        {activeTab === 'manual' && <ManualEditor onPublish={handleManualPublish} />}
        {activeTab === 'profile' && <AdminProfilePanel profile={adminProfile} onSave={setAdminProfile} />}
      </DashboardLayout>
    );
  }

  // 3. Single Post
  if (currentPath === '/post' && selectedPost) {
    return <SinglePost 
      post={selectedPost} 
      adSettings={adSettings}
      onBack={() => navigate('/')} 
      onNavigateCategory={navigateToCategory}
      onAddComment={(author, content) => handleAddComment(selectedPost.id, author, content)}
      onReplyComment={(commentId, author, content) => handleReplyComment(selectedPost.id, commentId, author, content)}
    />;
  }

  // 4. Category Page
  if (currentPath === '/category' && selectedCategory) {
    return <CategoryPage 
       category={selectedCategory} 
       posts={posts} 
       adSettings={adSettings}
       onNavigate={navigate} 
       onViewPost={handleViewPost} 
    />
  }

  // 5. Public Blog (Home)
  return <PublicBlog posts={posts} adSettings={adSettings} onNavigate={navigate} onViewPost={handleViewPost} onNavigateCategory={navigateToCategory} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
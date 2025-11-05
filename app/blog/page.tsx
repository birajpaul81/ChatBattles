'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Calendar, ArrowRight, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';


// Blog post type
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: 'comparison' | 'tutorial' | 'news' | 'tips';
  readTime: number;
  publishedAt: string;
  featured: boolean;
  image?: string;
}

// Featured blog posts (will be moved to CMS/database later)
const featuredPosts: BlogPost[] = [
  {
    slug: 'gpt5-vs-llama4-coding-comparison',
    title: 'GPT-5 vs Llama-4: Which AI is Better for Coding in 2025?',
    excerpt: 'A comprehensive comparison of GPT-5 and Llama-4 for programming tasks, including speed, accuracy, and language support analysis.',
    category: 'comparison',
    readTime: 8,
    publishedAt: '2025-01-15',
    featured: true,
  },
  {
    slug: 'prompt-engineering-tips-2025',
    title: '10 Prompt Engineering Tips for Better AI Responses',
    excerpt: 'Master the art of crafting perfect prompts with these proven techniques to get better results from any AI model.',
    category: 'tutorial',
    readTime: 6,
    publishedAt: '2025-01-14',
    featured: true,
  },
  {
    slug: 'whats-new-gpt5',
    title: "What's New in GPT-5: Complete Feature Breakdown",
    excerpt: 'OpenAI just released GPT-5 with groundbreaking features. Here\'s everything you need to know about the latest AI model.',
    category: 'news',
    readTime: 10,
    publishedAt: '2025-01-13',
    featured: true,
  },
];

const recentPosts: BlogPost[] = [
  {
    slug: 'deepseek-vs-gpt5-technical-analysis',
    title: 'DeepSeek vs GPT-5: Technical Analysis Showdown',
    excerpt: 'Deep dive into the technical capabilities of DeepSeek v3.1 and GPT-5, comparing reasoning, problem-solving, and accuracy.',
    category: 'comparison',
    readTime: 12,
    publishedAt: '2025-01-12',
    featured: false,
  },
  {
    slug: 'best-ai-creative-writing-2025',
    title: 'Best AI Model for Creative Writing in 2025',
    excerpt: 'We tested all major AI models for creative writing. Here are the results and recommendations for authors and content creators.',
    category: 'comparison',
    readTime: 9,
    publishedAt: '2025-01-11',
    featured: false,
  },
  {
    slug: 'using-ai-for-research-guide',
    title: 'Using AI for Research: A Complete Guide',
    excerpt: 'Learn how to leverage AI models for academic research, literature reviews, and data analysis with practical examples.',
    category: 'tutorial',
    readTime: 15,
    publishedAt: '2025-01-10',
    featured: false,
  },
  {
    slug: 'gemini-vs-gpt5-vision-capabilities',
    title: 'Gemini 2.5 vs GPT-5: Vision Capabilities Compared',
    excerpt: 'Which AI model is better at analyzing images? We put Gemini and GPT-5 through comprehensive vision tests.',
    category: 'comparison',
    readTime: 11,
    publishedAt: '2025-01-09',
    featured: false,
  },
  {
    slug: 'ai-powered-study-techniques',
    title: 'AI-Powered Study Techniques That Actually Work',
    excerpt: 'Discover how students are using AI to improve learning outcomes with these evidence-based study techniques.',
    category: 'tutorial',
    readTime: 7,
    publishedAt: '2025-01-08',
    featured: false,
  },
  {
    slug: 'which-ai-best-for-students',
    title: 'Which AI Model is Best for Students?',
    excerpt: 'A student-focused comparison of AI models, covering homework help, essay writing, and exam preparation.',
    category: 'comparison',
    readTime: 8,
    publishedAt: '2025-01-07',
    featured: false,
  },
];

const categories = [
  { id: 'all', name: 'All Posts', icon: BookOpen, count: 9 },
  { id: 'comparison', name: 'Comparisons', icon: TrendingUp, count: 5 },
  { id: 'tutorial', name: 'Tutorials', icon: Sparkles, count: 3 },
  { id: 'news', name: 'News', icon: Calendar, count: 1 },
];

function getCategoryColor(category: string) {
  const colors = {
    comparison: 'bg-accent/10 text-accent border-accent/20',
    tutorial: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    news: 'bg-green-500/10 text-green-500 border-green-500/20',
    tips: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };
  return colors[category as keyof typeof colors] || colors.tips;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function BlogCard({ post, featured = false, delay = 0 }: { post: BlogPost; featured?: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link 
        href={`/blog/${post.slug}`}
        className={`group block ${
          featured 
            ? 'bg-gradient-to-br from-accent/10 via-accent/5 to-transparent' 
            : 'bg-black/50'
        } backdrop-blur-sm border border-accent/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-accent hover:glow-orange transition-all duration-300 hover:scale-[1.02]`}
      >
        <div className="flex items-start justify-between mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(post.category)}`}>
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </span>
          {featured && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-accent to-orange-600 text-white shadow-lg">
              Featured
            </span>
          )}
        </div>
        
        <h3 className={`${featured ? 'text-lg sm:text-2xl' : 'text-base sm:text-xl'} font-orbitron font-bold text-white mb-2 sm:mb-3 group-hover:text-accent transition-colors`}>
          {post.title}
        </h3>
        
        <p className="text-softGray mb-3 sm:mb-4 line-clamp-2 leading-relaxed text-xs sm:text-sm">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-xs sm:text-sm text-softGray">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              <Calendar size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
          
          <span className="flex items-center gap-1 text-accent group-hover:gap-2 transition-all text-xs sm:text-sm">
            Read More <ArrowRight size={14} className="sm:w-[16px] sm:h-[16px]" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.h1
                className="text-3xl sm:text-5xl md:text-6xl font-orbitron font-black text-white mb-4 sm:mb-6"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(253, 99, 22, 0.5)",
                    "0 0 40px rgba(253, 99, 22, 0.8)",
                    "0 0 20px rgba(253, 99, 22, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AI Insights & <span className="text-accent">Tutorials</span>
              </motion.h1>
              <motion.p
                className="text-sm sm:text-xl text-softGray max-w-3xl mx-auto px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Discover the latest AI news, in-depth model comparisons, and expert tutorials to master AI technology
              </motion.p>
            </motion.div>

            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12"
            >
              {categories.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-black/50 backdrop-blur-sm border border-accent/30 rounded-lg hover:border-accent hover:glow-orange transition-all text-sm sm:text-base"
                  >
                    <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="whitespace-nowrap">{cat.name}</span>
                    <span className="text-[10px] sm:text-xs bg-accent/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      {cat.count}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-black text-white mb-6 sm:mb-8 flex items-center gap-2"
            >
              <Sparkles className="text-accent" />
              Featured Articles
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredPosts.map((post, index) => (
                <BlogCard key={post.slug} post={post} featured delay={0.1 + index * 0.1} />
              ))}
            </div>
          </div>
        </section>

        {/* Recent Posts */}
        <section className="px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-black text-white mb-6 sm:mb-8"
            >
              Recent Articles
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentPosts.map((post, index) => (
                <BlogCard key={post.slug} post={post} delay={0.1 + index * 0.1} />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-accent/10 to-red-600/10 border-2 border-accent/50 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center"
            >
              <h2 className="text-2xl sm:text-4xl font-orbitron font-black text-white mb-3 sm:mb-4">
                Stay Updated with AI Trends
              </h2>
              <p className="text-softGray mb-6 sm:mb-8 text-sm sm:text-lg">
                Subscribe to our newsletter and get the latest AI insights delivered to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-black/40 border border-accent/30 rounded-lg focus:outline-none focus:border-accent transition-colors text-white placeholder-white/40 text-sm sm:text-base"
                />
                <button className="px-6 sm:px-8 py-2.5 sm:py-3 gradient-orange text-white font-bold rounded-lg hover:scale-105 glow-orange-strong transition-all duration-300 whitespace-nowrap text-sm sm:text-base">
                  Subscribe
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Pose } from '../types';
import PoseCard from '../components/PoseCard';
import { Search, Loader, Filter } from 'lucide-react';
import { SAMPLE_CATEGORIES } from '../constants';

const Gallery: React.FC = () => {
  const [poses, setPoses] = useState<Pose[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPoses();
  }, []);

  const fetchPoses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Poses')
      .select(`
        *,
        cues (
          content, type, sequence
        )
      `)
      .order('name_zh', { ascending: true });

    if (error) {
      console.error("Error fetching poses:", error);
    } else {
      setPoses(data || []);
    }
    setLoading(false);
  };

  const filteredPoses = poses.filter(pose => {
    const matchesSearch = 
      pose.name_zh.includes(searchTerm) || 
      pose.name_en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? pose.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header / Search Area */}
      <div className="mb-8 sticky top-0 z-40 bg-yoga-bg/95 backdrop-blur-sm py-4">
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋體式、英文名稱..."
              className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-yoga-text shadow-sm focus:border-yoga-accent focus:ring-0 text-lg transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          </div>

          {/* Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
               onClick={() => setSelectedCategory(null)}
               className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-yoga-text text-white' : 'bg-white border border-gray-300 text-gray-600'}`}
            >
              全部
            </button>
            {SAMPLE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-yoga-accent text-white border-transparent' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="w-10 h-10 animate-spin text-yoga-accent" />
        </div>
      ) : (
        <>
          <p className="text-gray-500 mb-4 text-center">找到 {filteredPoses.length} 個體式</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPoses.map(pose => (
              <PoseCard key={pose.id} pose={pose} />
            ))}
          </div>
          {filteredPoses.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p>沒有找到相關體式</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Gallery;
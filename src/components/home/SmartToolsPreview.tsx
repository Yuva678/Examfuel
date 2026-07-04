import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, FileSearch, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import BounceCards from '../ui/BounceCards';

const SmartToolsPreview = () => {
  const cardImages = [
    "/platforms/learnkata.png",
    "/platforms/mindgrasp.png",
    "/platforms/examfuel.png",
    "/platforms/w3schools.png",
    "/platforms/geeksforgeeks.png"
  ];

  const transformStyles = [
    "rotate(6deg) translate(-140px)",
    "rotate(-3deg) translate(-70px)",
    "rotate(4deg)",
    "rotate(-5deg) translate(70px)",
    "rotate(5deg) translate(140px)"
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-transparent z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-50 border border-gold-border text-brand-500 text-sm font-semibold mb-6 shadow-soft">
              <Sparkles size={16} /> AI-Powered Learning
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">
              Supercharge your study sessions with Smart Tools
            </h2>
            <p className="text-lg text-gray-400 mb-8 font-medium">
              Don't just read notes. Understand them. Our smart tools help you summarize long PDFs, generate flashcards, and find key concepts instantly.
            </p>
            
            <div className="space-y-4">
              {[
                { icon: BrainCircuit, title: 'AI Summaries', desc: 'Get the gist of any 50-page PDF in seconds.' },
                { icon: Zap, title: 'Auto-Flashcards', desc: 'Instantly generate Anki-compatible flashcards from notes.' },
                { icon: FileSearch, title: 'Semantic Search', desc: 'Search for concepts, not just exact keywords.' },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface-50 transition-colors duration-300 border border-transparent hover:border-gold-border/50"
                >
                  <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500 border border-brand-500/20 shrink-0 shadow-soft">
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">{feature.title}</h4>
                    <p className="text-sm font-medium text-gray-400">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8">
              <Link
                to="/smart-stuff"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-black rounded-full font-bold shadow-gold-soft hover:shadow-gold transition-all duration-200 hover:scale-[1.02]"
              >
                Explore Smart Stuff
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-lg flex justify-center items-center h-80 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-full flex justify-center"
            >
              <BounceCards
                images={cardImages}
                containerWidth={400}
                containerHeight={280}
                animationDelay={0.3}
                animationStagger={0.06}
                easeType="elastic.out(1.1, 0.75)"
                transformStyles={transformStyles}
                enableHover={true}
              />
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default SmartToolsPreview;

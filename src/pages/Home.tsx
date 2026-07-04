import Hero from '../components/home/Hero';
import RecentlyUploaded from '../components/home/RecentlyUploaded';
import PopularResources from '../components/home/PopularResources';
import SemesterBrowse from '../components/home/SemesterBrowse';
import SmartToolsPreview from '../components/home/SmartToolsPreview';
import CommunityStats from '../components/home/CommunityStats';

const Home = () => {
  return (
    <div className="w-full">
      <Hero />
      <RecentlyUploaded />
      <PopularResources />
      <SemesterBrowse />
      <SmartToolsPreview />
      <CommunityStats />
    </div>
  );
};

export default Home;

//app/members/page.js
'use client';
import Navbar from '../components/Navbar'; // Adjust the path as needed
import Footer from '../components/Footer'; // Adjust the path as needed
import ScrollToTop from '../components/ScrollToTop';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from 'next/image';

// Dummy Data for Other Members
const membersData = {
  staff: [
    {
      id: '002',
      name: 'John Smith',
      email: 'john.smith@example.com',
      designation: 'Lab Manager',
      description: 'Experienced in lab management and safety protocols.',
      img: '/images/member/staff/staff (1).jpg',
    },
    {
      id: '003',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      designation: 'Technical Assistant',
      description: 'Assists in technical setup and system management.',
      img: '/images/member/staff/staff (2).jpg',
    },
    // Add more staff data as needed
  ],
  postDoc: [
    {
      id: '004',
      name: 'Dr. Mark Lee',
      email: 'mark.lee@example.com',
      designation: 'Post Doc Researcher',
      description: 'Research in AI-driven automotive control systems.',
      img: '/images/member/post_doc_researcher/post_doc_researcher (1).jpg',
    },
    {
      id: '005',
      name: 'Dr. Emily Clark',
      email: 'emily.clark@example.com',
      designation: 'Post Doc Researcher',
      description: 'Exploring vehicle-to-vehicle communication technologies.',
      img: '/images/member/post_doc_researcher/post_doc_researcher (2).jpg',
    },
    // Add more post doc data as needed
  ],
  phd: [
    {
      id: '006',
      name: 'Tom Baker',
      email: 'tom.baker@example.com',
      designation: 'Ph.D Candidate',
      description: 'Research in automotive cybersecurity.',
      img: '/images/member/phd_candidate/phd_candidate (1).jpg',
    },
    {
      id: '007',
      name: 'Sophie Adams',
      email: 'sophie.adams@example.com',
      designation: 'Ph.D Candidate',
      description: 'Exploring autonomous vehicle sensor systems.',
      img: '/images/member/phd_candidate/phd_candidate (2).jpg',
    },
    // Add more PhD data as needed
  ],
  masc: [
    {
      id: '008',
      name: 'Mason Green',
      email: 'mason.green@example.com',
      designation: 'MASc Student',
      description: 'Studying the integration of AI in vehicle dynamics.',
      img: '/images/member/masc_student/masc_student (1).jpg',
    },
    {
      id: '009',
      name: 'Lily Brown',
      email: 'lily.brown@example.com',
      designation: 'MASc Student',
      description: 'Focusing on vehicle sensor fusion and machine learning.',
      img: '/images/member/masc_student/masc_student (2).jpg',
    },
    // Add more MASc student data as needed
  ],
};

export default function Member() {
  const [searchQuery, setSearchQuery] = useState('');
  const [professors, setProfessors] = useState([]);

  useEffect(() => {
    // Fetch professor data from the API
    const fetchProfessors = async () => {
      try {
        const response = await axios.get('/api/member');
        setProfessors(response.data);
      } catch (error) {
        console.error('Error fetching professor data:', error);
      }
    };

    fetchProfessors();
  }, []);

  const filterMembers = (category) =>
    membersData[category]?.filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.id.includes(searchQuery) ||
        member.designation.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const settings = {
      dots: true, 
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
    };

  const renderSocialMediaIcons = (socialmedia) => {
    const iconMap = {
      Facebook: '/images/social_icon/facebook.png',
      X: '/images/social_icon/x.png',
      Instagram: '/images/social_icon/instagram.png',
      Linkedin: '/images/social_icon/linkedin.png',
      GitHub: '/images/social_icon/github.png',
      Website: '/images/social_icon/website.png',
    };

    return socialmedia.map((media) => (
      <a
        key={media.socialmedia_name}
        href={media.link}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-opacity hover:opacity-80"
        aria-label={media.socialmedia_name}
      >
        <Image 
          src={iconMap[media.socialmedia_name]} // Dynamic image source based on the social media name
          alt={media.socialmedia_name} // Alt text for accessibility
          width={24} // 6 * 4 = 24px width
          height={24} // 6 * 4 = 24px height
          className="w-6 h-6" // Tailwind classes for sizing
          quality={100} // Ensures maximum quality, by default Next.js optimizes images for performance but this ensures no compression
        />
      </a>
    ));
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main>
        <section className="relative flex items-center justify-center h-[35vh] md:h-[45vh] bg-cover bg-center">
          {/* Background Overlay with Opacity */}
          <div
            className="absolute inset-0 bg-[url('/images/hero-bg3.png')] bg-cover bg-center"
            style={{ opacity: 0.5 }} // Adjust the opacity value (0.0 - 1.0)
          ></div>

          {/* Content Layer */}
          <div className="relative z-10 text-center p-6 md:p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 mt-10 leading-tight">
              Member Of MVSD LAB
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-800 mb-4">
              Discover our talented team members and their groundbreaking research in automotive technologies and AI.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 py-4">
          <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            {/* Breadcrumb Navigation */}
            <nav className="text-sm font-medium text-gray-800 mb-2 md:mb-0">
              <ol className="list-reset flex items-center space-x-2">
                <li>
                  <Link href="/home" className="text-blue-600 hover:text-blue-700 transition-colors duration-300 ease-in-out">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-600">Member</li>
              </ol>
            </nav>

            {/* Search Bar */}
            <div className="relative flex-grow md:max-w-xs">
              <input
                type="text"
                placeholder="Search by name, ID, email, or designation..."
                className="w-full pl-10 pr-4 py-2 rounded bg-white placeholder-gray-400 text-gray-700 border border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M16.65 11.65a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Members Section */}
        <section className="pb-6">
          
          <div className="max-w-screen-xl mx-auto px-4">
            {/* Professor Section with Carousel */}
            <div className="mb-12">
              <div className="flex justify-center items-center py-8">
                <h2 className="flex items-center text-gray-900 dark:text-gray-100">
                  <span className="flex-grow border-t border-gray-300 dark:border-gray-600"></span>
                  <span className="mx-4 px-4 py-2 text-xl font-semibold bg-gray-800 text-white rounded">
                    Meet Our Professor
                  </span>
                  <span className="flex-grow border-t border-gray-300 dark:border-gray-600"></span>
                </h2>
              </div>

              <Slider {...settings} className="max-w-4xl mx-auto relative min-h-[300px] pb-20"> {/* Added background color */}
                {professors.map((prof) => (
                  <div key={prof.id} className="bg-transparent border-2 border-gray-300 rounded p-8 hover:bg-gray-100 transition-all duration-300">
                    <div className="flex justify-center mb-6">
                    <Image 
                      src={prof.photo} // Dynamic image source
                      alt={`${prof.first_name} ${prof.last_name}`} // Dynamic alt text
                      width={176} // 44 * 4 = 176px width
                      height={176} // 44 * 4 = 176px height
                      className="w-44 h-44 rounded-full object-cover border-4 border-gray-200 shadow-md" // Tailwind classes for styling
                      quality={100} // Ensure the image is displayed in the highest quality
                    />
                    </div>
                    <div className="text-center">
                      <h4 className="text-gray-900 text-2xl font-semibold mb-2">{`${prof.first_name} ${prof.last_name}`}</h4>
                      <p className="text-gray-600 text-sm mb-2"><strong>Email :</strong> {prof.email}</p>
                      <p className="text-blue-600 text-sm mb-2"><strong>ID :</strong> {prof.id}</p>
                      <p className="text-gray-600 text-base mb-6">{prof.short_bio}</p>
                      <div className="flex justify-center space-x-6">
                        {prof.socialmedia && renderSocialMediaIcons(prof.socialmedia)}
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>

            </div>

            {/* Other Sections with Common Design */}
            {['staff', 'postDoc', 'phd', 'masc'].map((category) => (
              <div key={category} className="mb-12">
                <div className="relative flex justify-center items-center mb-6">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-gray-400 dark:bg-gray-500"></div>
                  <h2 className="relative z-10 px-6 py-3 text-lg md:text-2xl font-semibold text-gray-800 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded shadow-md transform transition-transform duration-300 hover:scale-105">
                    {category === 'postDoc' ? 'Post Doc Researcher' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </h2>
                </div>

                <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-8 max-sm:justify-center text-center">
                  {filterMembers(category).map((member) => (
                    <div key={member.id} className="bg-gray-100 rounded p-6 shadow-md hover:scale-105 transition-all duration-500 mx-auto">
                      <div className="lg:min-h-[250px]">
                      <Image 
                        src={member.img} // Dynamic image source
                        alt={member.name} // Alt text for accessibility
                        width={500} // Set an appropriate width (adjust based on layout)
                        height={500} // Set an appropriate height (adjust based on layout)
                        className="w-full rounded inline-block" // Tailwind classes for styling
                      />
                      </div>
                      <div className="mt-6">
                        <h4 className="text-gray-800 text-lg font-bold" style={{ color: 'var(--heading-color)' }}>
                          {member.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{member.email}</p>
                        <p className="text-sm text-gray-600 mt-1">ID: {member.id}</p>
                        <p className="text-sm text-gray-600 mt-1">{member.description}</p>
                        <div className="space-x-4 mt-6">
                          <a href="#" className="w-7 h-7 inline-flex items-center justify-center rounded-full border-none outline-none bg-gray-100 hover:bg-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12px" fill="#333" viewBox="0 0 155.139 155.139">
                              <path d="M89.584 155.139V84.378h23.742l3.562-27.585H89.584V39.184c0-7.984 2.208-13.425 13.67-13.425l14.595-.006V1.08C115.325.752 106.661 0 96.577 0 75.52 0 61.104 12.853 61.104 36.452v20.341H37.29v27.585h23.814v70.761h28.48z" />
                            </svg>
                          </a>
                          <a href="#" className="w-7 h-7 inline-flex items-center justify-center rounded-full border-none outline-none bg-gray-100 hover:bg-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12px" fill="#333" viewBox="0 0 512 512">
                              <path d="M512 97.248c-19.04 8.352-39.328 13.888-60.48 16.576 21.76-12.992 38.368-33.408 46.176-58.016-20.288 12.096-42.688 20.64-66.56 25.408C411.872 60.704 384.416 48 354.464 48c-58.112 0-104.896 47.168-104.896 104.992 0 8.32.704 16.32 2.432 23.936-87.264-4.256-164.48-46.08-216.352-109.792-9.056 15.712-14.368 33.696-14.368 53.056 0 36.352 18.72 68.576 46.624 87.232-16.864-.32-33.408-5.216-47.424-12.928v1.152c0 51.008 36.384 93.376 84.096 103.136-8.544 2.336-17.856 3.456-27.52 3.456-6.72 0-13.504-.384-19.872-1.792 13.6 41.568 52.192 72.128 98.08 73.12-35.712 27.936-81.056 44.768-130.144 44.768-8.608 0-16.864-.384-25.12-1.44C46.496 446.88 101.6 464 161.024 464c193.152 0 298.752-160 298.752-298.688 0-4.64-.16-9.12-.384-13.568 20.832-14.784 38.336-33.248 52.608-54.496z" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <ScrollToTop />
      <Footer />
    </div>
  );
}
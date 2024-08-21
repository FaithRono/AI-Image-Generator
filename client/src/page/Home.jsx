import {useEffect, useState} from 'react';
import { Card, FormField, Loader } from '../components';
import styled from 'styled-components';

const GetStartedButton = styled.button`
  position: absolute;
  top: 2rem;
  right: 14.5rem;
  padding: 1rem 2rem;
  background-image: linear-gradient(to right, #00c6ff, #0072ff);
  color: white;
  font-size: 1.25rem;
  font-weight: bold;
  border: none;
  border-radius: 2rem;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-image 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-image: linear-gradient(to right, #0072ff, #00c6ff);
    transform: scale(1.1);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
  }
`;

const FAQContainer = styled.div`
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #ff7875;
  }
`;

const FAQButton = styled.button`
  width: 100%;
  text-align: left;
  font-size: 1.125rem;
  font-weight: bold;
  background: #f0f9ff;
  color: #0072ff;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;

  &:hover {
    background: #e0f7fa;
    transform: translateY(-3px);
  }
`;

const Answer = styled.p`
  margin-top: 0.75rem;
  color: #333;
  font-size: 1rem;
`;
const RenderCards = ({ data, title }) => {
  if (data?.length > 0) {
    return data.map((post) => <Card key={post._id} {...post} />);
  }

  return (
    <h2 className="mt-5 font-bold text-[#0072ff] text-xl uppercase">{title}</h2>
  );
};

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchedResults, setSearchedResults] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Check if result is an array
        if (Array.isArray(result['data'])) {
          setAllPosts(result['data'].reverse()); // Reverse the array if it is valid
        } else {
          throw new Error('Expected an array of posts but received: ' + JSON.stringify(result));
        }
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      alert('An error occurred while fetching posts.');
    } finally {
      setLoading(false);
    }

  };
    useEffect(() => {
    fetchPosts().then(r => console.log(r) );
  }, []);

  const handleSearchChange = (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value;
    setSearchText(query);

    setSearchTimeout(
      setTimeout(() => {
        const searchResult = allPosts?.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.prompt.toLowerCase().includes(query.toLowerCase())
        );
        setSearchedResults(searchResult);
      }, 500)
    );
  };

  const toggleAnswers = (question) => {
    if (activeQuestion === question) {
      setShowAnswers(!showAnswers);
    } else {
      setShowAnswers(true);
      setActiveQuestion(question);
    }
  };

  const handleCloseFAQ = () => {
    setShowAnswers(false);
    setActiveQuestion(null);
  };

  return (
    <section className="max-w-7xl mx-auto">
      <GetStartedButton onClick={() => setShowAnswers(!showAnswers)}>
        Don't know where to start? Get Started here
      </GetStartedButton>

      <div>
        <h1 className="font-bold text-transparent text-[36px] bg-clip-text bg-gradient-to-r from-green-300 via-teal-400 to-blue-500">
          Explore the Creative Universe
        </h1>
        <p className="mt-4 text-[#004d4d] text-[16px] max-w-[600px]">
          Dive into a world of awe-inspiring, AI-generated art, curated by the community for your inspiration and delight. Experience the fusion of technology and creativity with DALL-E AI.
        </p>
      </div>

      <div className="mt-16">
        <FormField
          labelName="Search posts"
          type="text"
          name="text"
          placeholder="Search something..."
          value={searchText}
          handleChange={handleSearchChange}
        />
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <>
            {searchText && (
              <h2 className="font-medium text-[#666e75] text-xl mb-3">
                Showing Results for <span className="text-[#222328]">{searchText}</span>:
              </h2>
            )}
            
            <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-4">
              {searchText ? (
                <RenderCards
                  data={searchedResults}
                  title="No Search Results Found"
                />
              ) : (
                <RenderCards
                  data={allPosts}
                  title="No Posts Yet"
                />
              )}
            </div>
            {showAnswers && (
              <FAQContainer>
                <CloseButton onClick={handleCloseFAQ}>×</CloseButton>
                <h2 className="text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <div>
                    <FAQButton onClick={() => toggleAnswers('question1')}>
                      How do I generate an image?
                    </FAQButton>
                    {showAnswers && activeQuestion === 'question1' && (
                      <Answer>
                        To generate an image, enter a prompt in the search field or click the "Surprise Me" button to get a random prompt. After setting the prompt, click the "Generate Image" button to see your image.
                      </Answer>
                    )}
                  </div>
                  <div>
                    <FAQButton onClick={() => toggleAnswers('question2')}>
                      How do I search for posts?
                    </FAQButton>
                    {showAnswers && activeQuestion === 'question2' && (
                      <Answer>
                        Use the search field at the top of the page to find posts by name or prompt. Type in your keywords and the results will be displayed below.
                      </Answer>
                    )}
                  </div>
                  <div>
                    <FAQButton onClick={() => toggleAnswers('question3')}>
                      What should I do if there are no results?
                    </FAQButton>
                    {showAnswers && activeQuestion === 'question3' && (
                      <Answer>
                        If no results are found, try modifying your search terms or check back later as new posts may be added.
                      </Answer>
                    )}
                  </div>
                </div>
                <p className="mt-6 text-center text-gray-100">
                  © 2024 Your Company. All rights reserved.
                </p>
              </FAQContainer>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Home;

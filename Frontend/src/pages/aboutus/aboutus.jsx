import React from 'react';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import './aboutus.css';

const AboutUs = () => {
  return (
    <div className="about-us-page">
      <Navbar />
      <header className="about-header">
        <h1>About Us</h1>
        <p>Preserving the cultural and musical heritage of Rajasthan's communities.</p>
      </header>
      <section className="introduction">
        <h2>Digital Mapping of Rajasthan's Performing Artist Communities</h2>
        <p>
          This research project aims to map Rajasthan's performing arts communities to bridge the documentation gap, 
          improve information accessibility, and provide inclusive and comprehensive data. Our goal is to develop 
          innovative preservation projects and methodologies, unlocking Rajasthan’s rich cultural heritage. By doing so, 
          we aim to safeguard and empower Rajasthan's artist communities, ensuring their traditions thrive in the modern era.
        </p>
      </section>
      <section className="the-problem">
        <h2>The Problem</h2>
        <p>
          Rajasthan is renowned for its vibrant performing arts, yet many traditional practices are disappearing, and artist 
          communities face growing challenges. Oral art forms, once deeply embedded in historical social systems, have lost 
          their original functions due to modern shifts, pushing artists toward tourism and commercial entertainment.
        </p>
        <p>
          Despite the existence of around 45 artist communities, the lack of comprehensive documentation severely hampers 
          preservation efforts. While some groups, like the Kalbeliyas, Langas, and Manganiyars, have received limited scholarly 
          attention, most remain undocumented, making it difficult to develop effective preservation strategies.
        </p>
        <p>
          Furthermore, no centralized digital platform exists to consolidate and share this knowledge, restricting access for 
          researchers, artists, and cultural enthusiasts. With the last bearers of traditional knowledge fading, urgent action 
          is needed. This research project aims to fill that gap before it is too late.
        </p>
      </section>
      <section className="objectives">
  <h2>Objectives</h2>
  <div className="objectives-list">
    <div className="objective-item">
      <span className="icon">🗺️</span>
      <div>
        <strong>Document and Map:</strong>
        <p>Record details about Rajasthan's performing artists, including their communities, musical practices, instruments, repertoire, and indicators of socio-economic conditions.</p>
      </div>
    </div>
    <div className="objective-item">
      <span className="icon">💻</span>
      <div>
        <strong>Create Digital Platform:</strong>
        <p>Develop an open-access digital platform for the compiled data.</p>
      </div>
    </div>
    <div className="objective-item">
      <span className="icon">🌐</span>
      <div>
        <strong>Innovate Methodologies:</strong>
        <p>Develop innovative mapping methodologies applicable to other regions.</p>
      </div>
    </div>
  </div>
</section>
      <section className="research-significance">
  <h2>Research Significance</h2>
  <p>This project is crucial for:</p>
  <div className="significance-list">
    <div className="significance-item">
      <span className="icon">🎭</span>
      <div>
        <strong>Preservation of Cultural Heritage of Rajasthan:</strong>
        <p>Documenting Rajasthan's artist communities to develop targeted preservation initiatives.</p>
      </div>
    </div>
    <div className="significance-item">
      <span className="icon">💡</span>
      <div>
        <strong>Empowerment:</strong>
        <p>Using collected data to empower artist communities through contemporary practices and technologies.</p>
      </div>
    </div>
    <div className="significance-item">
      <span className="icon">🌍</span>
      <div>
        <strong>Global Model:</strong>
        <p>Providing a framework for similar preservation efforts globally.</p>
      </div>
    </div>
  </div>
</section>
      <section className="methodology">
        <h2>Methodology</h2>
        <p>
          With IIT Jodhpur centrally located in Rajasthan, the project benefits from local and international expert scholars in 
          ethnography and sociology, combined with technical expertise in digitization. Researchers will conduct field research, 
          interviews, and use mapping tools to gather comprehensive data from artist communities across Rajasthan. This data will 
          be digitized and made accessible through a centralized platform.
        </p>
      </section>
      <section className="our-team">
        <h2>Our Team</h2>
        <h3>Faculties</h3>
        <ul>
          <li>Dr. Ayla Joncheere - Professor for ethnography and performing arts</li>
          <li>Dr. Prasenjeet Tribhuvan - Professor for cultural anthropology</li>
        </ul>
        <h3>Students</h3>
        <ul>
          <li>Tanmay</li>
          <li>Prakash</li>
        </ul>
      </section>
      <Footer />
    </div>
  );
};

export default AboutUs;
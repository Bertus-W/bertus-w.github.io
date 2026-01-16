document.addEventListener("DOMContentLoaded", () => {
  const langEnBtn = document.getElementById("lang-en");
  const langNlBtn = document.getElementById("lang-nl");
  let currentLang = localStorage.getItem("lang") || "en";

  const projectGrid = document.querySelector(".project-grid");
  const experiencesContainer = document.querySelector(
    "#experiences .experience-list",
  );

  const fetchTranslations = fetch("translations.json").then((response) =>
    response.json(),
  );
  const fetchProjects = fetch("projects.json").then((response) =>
    response.json(),
  );
  const fetchExperiences = fetch("experiences.json").then((response) =>
    response.json(),
  );

  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  // Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const renderSkillBadges = (skills) => {
    if (!skills || skills.length === 0) return "";
    return `
      <div class="card-skills">
        ${skills.map((skill) => `<span class="card-skill">${skill}</span>`).join("")}
      </div>
    `;
  };

  const setLanguage = (lang) => {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;

    // Update active button state
    langEnBtn.classList.toggle("active", lang === "en");
    langNlBtn.classList.toggle("active", lang === "nl");

    Promise.all([fetchTranslations, fetchProjects, fetchExperiences])
      .then(([translations, projects, experiences]) => {
        // Translate static text
        document.querySelectorAll("[data-translate]").forEach((el) => {
          const key = el.getAttribute("data-translate");
          if (translations[lang][key]) {
            el.innerHTML = translations[lang][key];
          }
        });
        document.querySelector(".hero-about-text").innerHTML =
          translations[lang]["hero_about_text"];

        // Clear existing dynamic content
        projectGrid.innerHTML = "";
        experiencesContainer.innerHTML = "";

        // Populate experiences with timeline design
        experiences.forEach((experience) => {
          const experienceCard = document.createElement("div");
          experienceCard.classList.add("experience-card");

          const logoHtml = experience.image
            ? `<img src="${experience.image}" alt="${experience.company}" class="experience-card-logo" onerror="this.style.display='none'">`
            : "";

          experienceCard.innerHTML = `
            <div class="experience-card-header">
              ${logoHtml}
              <div class="experience-card-title">
                <h3>${experience.role} at ${experience.company}</h3>
                <p class="duration">${experience.duration}</p>
              </div>
            </div>
            <p>${experience["description_" + lang]}</p>
            ${renderSkillBadges(experience.skills)}
          `;
          experiencesContainer.appendChild(experienceCard);
          observer.observe(experienceCard);
        });

        // Populate projects with images
        projects.forEach((project) => {
          const projectCard = document.createElement("div");
          projectCard.classList.add("project-card");

          const imageHtml = project.image
            ? `<img src="${project.image}" alt="${project.name}" class="project-card-image" onerror="this.style.display='none'">`
            : "";

          const viewText = lang === "nl" ? "Bekijk op GitHub" : "View on GitHub";

          projectCard.innerHTML = `
            ${imageHtml}
            <div class="project-card-content">
              <h3>${project.name}</h3>
              <p>${project["description_" + lang]}</p>
              ${renderSkillBadges(project.skills)}
              <a href="${project.url}">${viewText}</a>
            </div>
          `;
          projectGrid.appendChild(projectCard);
          observer.observe(projectCard);
        });
      })
      .catch((error) => console.error("Error loading data:", error));
  };

  langEnBtn.addEventListener("click", () => setLanguage("en"));
  langNlBtn.addEventListener("click", () => setLanguage("nl"));

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("nav-active");
  });

  // Set initial language
  setLanguage(currentLang);
});

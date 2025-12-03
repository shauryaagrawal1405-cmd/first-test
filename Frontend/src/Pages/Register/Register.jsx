import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import { skills } from "./Skills";
import axios from "axios";
import "./Register.css";
import Badge from "react-bootstrap/Badge";
import { v4 as uuidv4 } from "uuid";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Get Backend URL from Env
  const serverUrl = import.meta.env.VITE_SERVER_URL; 

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    portfolioLink: "",
    githubLink: "",
    linkedinLink: "",
    skillsProficientAt: [],
    skillsToLearn: [],
    education: [
      {
        id: uuidv4(),
        institution: "",
        degree: "",
        startDate: "",
        endDate: "",
        score: "",
        description: "",
      },
    ],
    bio: "",
    projects: [],
  });
  const [skillsProficientAt, setSkillsProficientAt] = useState("Select some skill");
  const [skillsToLearn, setSkillsToLearn] = useState("Select some skill");
  const [techStack, setTechStack] = useState([]);
  const [activeKey, setActiveKey] = useState("registration");

  // ✅ FIX: Logic to handle URL Token + Header Authorization
  useEffect(() => {
    setLoading(true);
    const getUser = async () => {
      // 1. Check URL for token
      const queryParams = new URLSearchParams(window.location.search);
      const urlToken = queryParams.get("token");

      // 2. Save token to LocalStorage if present
      if (urlToken) {
        localStorage.setItem("registrationToken", urlToken);
        // Remove token from URL for security
        window.history.replaceState({}, document.title, "/register");
      }

      // 3. Get token from storage
      const storedToken = localStorage.getItem("registrationToken");

      if (!storedToken) {
        toast.error("No authentication token found. Please login.");
        navigate("/login");
        setLoading(false);
        return;
      }

      try {
        // 4. Send token in Header
        const { data } = await axios.get(`${serverUrl}/user/unregistered/getDetails`, {
          withCredentials: true,
          headers: {
             Authorization: `Bearer ${storedToken}` // <--- Critical Header
          }
        });

        console.log("User Data: ", data.data);
        
        // Populate Form
        const edu = data?.data?.education || [];
        edu.forEach((ele) => { ele.id = uuidv4(); });
        
        if (edu.length === 0) {
          edu.push({
            id: uuidv4(),
            institution: "",
            degree: "",
            startDate: "",
            endDate: "",
            score: "",
            description: "",
          });
        }
        
        const proj = data?.data?.projects;
        if (proj) {
            proj.forEach((ele) => { ele.id = uuidv4(); });
            setTechStack(proj.map(() => "Select some Tech Stack"));
        }

        setForm((prevState) => ({
          ...prevState,
          name: data?.data?.name || "",
          email: data?.data?.email || "",
          username: data?.data?.username || "",
          skillsProficientAt: data?.data?.skillsProficientAt || [],
          skillsToLearn: data?.data?.skillsToLearn || [],
          linkedinLink: data?.data?.linkedinLink || "",
          githubLink: data?.data?.githubLink || "",
          portfolioLink: data?.data?.portfolioLink || "",
          education: edu,
          bio: data?.data?.bio || "",
          projects: proj ? proj : prevState.projects,
        }));
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          // toast.error("Authentication failed.");
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [navigate, serverUrl]);

  // --- Helper Functions (Standard Logic) ---
  const handleNext = () => {
    const tabs = ["registration", "education", "longer-tab", "Preview"];
    const currentIndex = tabs.indexOf(activeKey);
    if (currentIndex < tabs.length - 1) {
      setActiveKey(tabs[currentIndex + 1]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prevState) => ({
        ...prevState,
        [name]: checked ? [...prevState[name], value] : prevState[name].filter((item) => item !== value),
      }));
    } else {
      if (name === "bio" && value.length > 500) {
        toast.error("Bio should be less than 500 characters");
        return;
      }
      setForm((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleAddSkill = (e) => {
    const { name } = e.target;
    if (name === "skill_to_learn") {
      if (skillsToLearn === "Select some skill") return toast.error("Select a skill to add");
      if (form.skillsToLearn.includes(skillsToLearn)) return toast.error("Skill already added");
      if (form.skillsProficientAt.includes(skillsToLearn)) return toast.error("Skill already added in skills proficient at");
      setForm((prevState) => ({ ...prevState, skillsToLearn: [...prevState.skillsToLearn, skillsToLearn] }));
    } else {
      if (skillsProficientAt === "Select some skill") return toast.error("Select a skill to add");
      if (form.skillsProficientAt.includes(skillsProficientAt)) return toast.error("Skill already added");
      if (form.skillsToLearn.includes(skillsProficientAt)) return toast.error("Skill already added in skills to learn");
      setForm((prevState) => ({ ...prevState, skillsProficientAt: [...prevState.skillsProficientAt, skillsProficientAt] }));
    }
  };

  const handleRemoveSkill = (e, temp) => {
    const skill = e.target.innerText.split(" ")[0];
    if (temp === "skills_proficient_at") {
      setForm((prevState) => ({ ...prevState, skillsProficientAt: prevState.skillsProficientAt.filter((item) => item !== skill) }));
    } else {
      setForm((prevState) => ({ ...prevState, skillsToLearn: prevState.skillsToLearn.filter((item) => item !== skill) }));
    }
  };

  const handleRemoveEducation = (e, tid) => {
    const updatedEducation = form.education.filter((item) => item.id !== tid);
    setForm((prevState) => ({ ...prevState, education: updatedEducation }));
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      education: prevState.education.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
  };

  const handleAdditionalChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      projects: prevState.projects.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
  };

  // --- Validations ---
  const validateRegForm = () => {
    if (!form.username) { toast.error("Username is empty"); return false; }
    if (!form.skillsProficientAt.length) { toast.error("Enter atleast one Skill you are proficient at"); return false; }
    if (!form.skillsToLearn.length) { toast.error("Enter atleast one Skill you want to learn"); return false; }
    if (!form.portfolioLink && !form.githubLink && !form.linkedinLink) { toast.error("Enter atleast one link among portfolio, github and linkedin"); return false; }
    const githubRegex = /github\.com/;
    if (form.githubLink && !githubRegex.test(form.githubLink)) { toast.error("Enter a valid github link"); return false; }
    const linkedinRegex = /linkedin\.com/;
    if (form.linkedinLink && !linkedinRegex.test(form.linkedinLink)) { toast.error("Enter a valid linkedin link"); return false; }
    if (form.portfolioLink && !form.portfolioLink.includes("http")) { toast.error("Enter a valid portfolio link (must include http/https)"); return false; }
    return true;
  };

  const validateEduForm = () => {
    let isValid = true;
    form.education.forEach((edu, index) => {
      if (!edu.institution || !edu.degree || !edu.startDate || !edu.endDate || !edu.score) {
        toast.error(`Please fill all fields in Education #${index + 1}`);
        isValid = false;
      }
    });
    return isValid;
  };

  const validateAddForm = () => {
    if (!form.bio) { toast.error("Bio is empty"); return false; }
    if (form.bio.length > 500) { toast.error("Bio should be less than 500 characters"); return false; }
    let flag = true;
    form.projects.forEach((project, index) => {
      if (!project.title || !project.techStack.length || !project.startDate || !project.endDate || !project.projectLink || !project.description) {
        toast.error(`Please fill all fields in Project #${index + 1}`);
        flag = false;
      }
      if (project.startDate > project.endDate) {
        toast.error(`Start Date should be less than End Date in project ${index + 1}`);
        flag = false;
      }
    });
    return flag;
  };

  // --- Save Functions with Header ---
  const handleSaveRegistration = async () => {
    const check = validateRegForm();
    const token = localStorage.getItem("registrationToken");
    if (check) {
      setSaveLoading(true);
      try {
        // ✅ Add Header
        await axios.post(`${serverUrl}/user/unregistered/saveRegDetails`, form, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSaveEducation = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const token = localStorage.getItem("registrationToken");
    if (check1 && check2) {
      setSaveLoading(true);
      try {
        // ✅ Add Header
        await axios.post(`${serverUrl}/user/unregistered/saveEduDetail`, form, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSaveAdditional = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = validateAddForm();
    const token = localStorage.getItem("registrationToken");
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        // ✅ Add Header
        await axios.post(`${serverUrl}/user/unregistered/saveAddDetail`, form, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = validateAddForm();
    const token = localStorage.getItem("registrationToken");
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        // ✅ Add Header
        const { data } = await axios.post(`${serverUrl}/user/registerUser`, form, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Registration Successful");
        console.log("Data: ", data.data);
        
        // Clear temp token on success
        localStorage.removeItem("registrationToken");
        
        // IMPORTANT: If your backend returns a NEW Access Token for the registered user, save it here:
        // localStorage.setItem("accessToken", data.data.accessToken); 
        
        navigate("/discover");
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };

  return (
    <div className="register_page ">
      <h1 className="m-4" style={{ fontFamily: "Oswald", color: "#3BB4A1" }}>
        Registration Form
      </h1>
      {loading ? (
        <div className="row m-auto w-100 d-flex justify-content-center align-items-center" style={{ height: "80.8vh" }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="register_section mb-3">
          <Tabs
            defaultActiveKey="registration"
            id="justify-tab-example"
            className="mb-3"
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k)}
          >
            <Tab eventKey="registration" title="Registration">
              <div>
                <label style={{ color: "#3BB4A1" }}>Name</label>
                <br />
                <input
                  type="text"
                  name="username"
                  onChange={handleInputChange}
                  style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }}
                  value={form.name}
                  disabled
                />
              </div>
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Email
                </label>
                <br />
                <input
                  type="text"
                  name="username"
                  onChange={handleInputChange}
                  style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }}
                  value={form.email}
                  disabled
                />
              </div>
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>Username</label>
                <br />
                <input type="text" name="username" onChange={handleInputChange} value={form.username} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }} placeholder="Enter your username"/>
              </div>
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>Linkedin Link</label>
                <br />
                <input type="text" name="linkedinLink" value={form.linkedinLink} onChange={handleInputChange} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }} placeholder="Enter your Linkedin link"/>
              </div>
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>Github Link</label>
                <br />
                <input type="text" name="githubLink" value={form.githubLink} onChange={handleInputChange} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }} placeholder="Enter your Github link"/>
              </div>
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>Portfolio Link</label>
                <br />
                <input type="text" name="portfolioLink" value={form.portfolioLink} onChange={handleInputChange} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }} placeholder="Enter your portfolio link"/>
              </div>
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>Skills Proficient At</label>
                <br />
                <Form.Select aria-label="Default select example" value={skillsProficientAt} onChange={(e) => setSkillsProficientAt(e.target.value)}>
                  <option>Select some skill</option>
                  {skills.map((skill, index) => (<option key={index} value={skill}>{skill}</option>))}
                </Form.Select>
                {form.skillsProficientAt.length > 0 && (
                  <div>
                    {form.skillsProficientAt.map((skill, index) => (
                      <Badge key={index} bg="secondary" className="ms-2 mt-2" style={{ cursor: "pointer" }} onClick={(event) => handleRemoveSkill(event, "skills_proficient_at")}>
                        <div className="span d-flex p-1 fs-7 ">{skill} &#10005;</div>
                      </Badge>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary mt-3 ms-1" name="skill_proficient_at" onClick={handleAddSkill}>Add Skill</button>
              </div>
              <div>
                <label style={{ color: "#3BB4A1", marginTop: "20px" }}>Skills To Learn</label>
                <br />
                <Form.Select aria-label="Default select example" value={skillsToLearn} onChange={(e) => setSkillsToLearn(e.target.value)}>
                  <option>Select some skill</option>
                  {skills.map((skill, index) => (<option key={index} value={skill}>{skill}</option>))}
                </Form.Select>
                {form.skillsToLearn.length > 0 && (
                  <div>
                    {form.skillsToLearn.map((skill, index) => (
                      <Badge key={index} bg="secondary" className="ms-2 mt-2 " style={{ cursor: "pointer" }} onClick={(event) => handleRemoveSkill(event, "skills_to_learn")}>
                        <div className="span d-flex p-1 fs-7 ">{skill} &#10005;</div>
                      </Badge>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary mt-3 ms-1" name="skill_to_learn" onClick={handleAddSkill}>Add Skill</button>
              </div>
              <div className="row m-auto d-flex justify-content-center mt-3">
                <button className="btn btn-warning" onClick={handleSaveRegistration} disabled={saveLoading}>
                  {saveLoading ? <Spinner animation="border" variant="primary" /> : "Save"}
                </button>
                <button onClick={handleNext} className="mt-2 btn btn-primary">Next</button>
              </div>
            </Tab>

            <Tab eventKey="education" title="Education">
              {form.education.map((edu, index) => (
                <div className="border border-dark rounded-1 p-3 m-1" key={edu.id}>
                  {index !== 0 && (<span className="w-100 d-flex justify-content-end"><button className="w-25" onClick={(e) => handleRemoveEducation(e, edu.id)}>cross</button></span>)}
                  <label style={{ color: "#3BB4A1" }}>Institution Name</label><br />
                  <input type="text" name="institution" value={edu.institution} onChange={(e) => handleEducationChange(e, index)} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }} placeholder="Enter your institution name"/>
                  <label className="mt-2" style={{ color: "#3BB4A1" }}>Degree</label><br />
                  <input type="text" name="degree" value={edu.degree} onChange={(e) => handleEducationChange(e, index)} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }} placeholder="Enter your degree"/>
                  <label className="mt-2" style={{ color: "#3BB4A1" }}>Grade/Percentage</label><br />
                  <input type="number" name="score" value={edu.score} onChange={(e) => handleEducationChange(e, index)} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }} placeholder="Enter your grade/percentage"/>
                  <div className="row w-100">
                    <div className="col-md-6"><label className="mt-2" style={{ color: "#3BB4A1" }}>Start Date</label><br /><input type="date" name="startDate" value={edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : ""} onChange={(e) => handleEducationChange(e, index)} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }}/></div>
                    <div className="col-md-6"><label className="mt-2" style={{ color: "#3BB4A1" }}>End Date</label><br /><input type="date" name="endDate" value={edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : ""} onChange={(e) => handleEducationChange(e, index)} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }}/></div>
                  </div>
                  <label className="mt-2" style={{ color: "#3BB4A1" }}>Description</label><br />
                  <input type="text" name="description" value={edu.description} onChange={(e) => handleEducationChange(e, index)} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }} placeholder="Enter your exp or achievements"/>
                </div>
              ))}
              <div className="row my-2 d-flex justify-content-center">
                <button className="btn btn-primary w-50" onClick={() => { setForm((prevState) => ({ ...prevState, education: [...prevState.education, { id: uuidv4(), institution: "", degree: "", startDate: "", endDate: "", score: "", description: "" }] })); }}>Add Education</button>
              </div>
              <div className="row m-auto d-flex justify-content-center mt-3">
                <button className="btn btn-warning" onClick={handleSaveEducation} disabled={saveLoading}>{saveLoading ? <Spinner animation="border" variant="primary" /> : "Save"}</button>
                <button onClick={handleNext} className="mt-2 btn btn-primary">Next</button>
              </div>
            </Tab>

            <Tab eventKey="longer-tab" title="Additional">
              <div><label style={{ color: "#3BB4A1", marginTop: "20px" }}>Bio (Max 500 Character)</label><br /><textarea name="bio" value={form.bio} onChange={handleInputChange} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%", marginBottom: "10px" }} placeholder="Enter your bio"></textarea></div>
              <div className=""><label style={{ color: "#3BB4A1" }}>Projects</label>
                {form.projects.map((project, index) => (
                  <div className="border border-dark rounded-1 p-3 m-1" key={project.id}>
                    <span className="w-100 d-flex justify-content-end"><button className="w-25" onClick={() => { setForm((prevState) => ({ ...prevState, projects: prevState.projects.filter((item) => item.id !== project.id) })); }}>cross</button></span>
                    <label style={{ color: "#3BB4A1" }}>Title</label><br /><input type="text" name="title" value={project.title} onChange={(e) => handleAdditionalChange(e, index)} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }} placeholder="Enter your project title"/>
                    <label className="mt-2" style={{ color: "#3BB4A1" }}>Tech Stack</label><br />
                    <Form.Select aria-label="Default select example" value={techStack[index]} onChange={(e) => { setTechStack((prevState) => prevState.map((item, i) => (i === index ? e.target.value : item))); }}>
                      <option>Select some Tech Stack</option>
                      {skills.map((skill, index) => (<option key={index} value={skill}>{skill}</option>))}
                    </Form.Select>
                    {techStack[index] && techStack[index].length > 0 && (
                      <div>{form.projects[index].techStack.map((skill, i) => (<Badge key={i} bg="secondary" className="ms-2 mt-2" style={{ cursor: "pointer" }} onClick={(e) => { setForm((prevState) => ({ ...prevState, projects: prevState.projects.map((item, i) => i === index ? { ...item, techStack: item.techStack.filter((item) => item !== skill) } : item) })); }}><div className="span d-flex p-1 fs-7 ">{skill} &#10005;</div></Badge>))}</div>
                    )}
                    <button className="btn btn-primary mt-3 ms-1" name="tech_stack" onClick={(e) => { if (techStack[index] === "Select some Tech Stack") { toast.error("Select a tech stack to add"); return; } if (form.projects[index].techStack.includes(techStack[index])) { toast.error("Tech Stack already added"); return; } setForm((prevState) => ({ ...prevState, projects: prevState.projects.map((item, i) => i === index ? { ...item, techStack: [...item.techStack, techStack[index]] } : item) })); }}>Add Tech Stack</button>
                    <div className="row">
                      <div className="col-md-6"><label className="mt-2" style={{ color: "#3BB4A1" }}>Start Date</label><br /><input type="date" name="startDate" value={project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""} onChange={(e) => handleAdditionalChange(e, index)} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }}/></div>
                      <div className="col-md-6"><label className="mt-2" style={{ color: "#3BB4A1" }}>End Date</label><br /><input type="date" name="endDate" value={project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : ""} onChange={(e) => handleAdditionalChange(e, index)} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }}/></div>
                    </div>
                    <label className="mt-2" style={{ color: "#3BB4A1" }}>Project Link</label><br /><input type="text" name="projectLink" value={project.projectLink} onChange={(e) => handleAdditionalChange(e, index)} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }} placeholder="Enter your project link"/>
                    <label className="mt-2" style={{ color: "#3BB4A1" }}>Description</label><br /><input type="text" name="description" value={project.description} onChange={(e) => handleAdditionalChange(e, index)} style={{ borderRadius: "5px", border: "1px solid #3BB4A1", padding: "5px", width: "100%" }} placeholder="Enter your project description"/>
                  </div>
                ))}
                <div className="row my-2 d-flex justify-content-center">
                  <button className="btn btn-primary w-50" onClick={() => { setTechStack((prevState) => { return [...prevState, "Select some Tech Stack"]; }); setForm((prevState) => ({ ...prevState, projects: [...prevState.projects, { id: uuidv4(), title: "", techStack: [], startDate: "", endDate: "", projectLink: "", description: "" }] })); }}>Add Project</button>
                </div>
              </div>
              <div className="row m-auto d-flex justify-content-center mt-3">
                <button className="btn btn-warning" onClick={handleSaveAdditional} disabled={saveLoading}>{saveLoading ? <Spinner animation="border" variant="primary" /> : "Save"}</button>
                <button onClick={handleNext} className="mt-2 btn btn-primary">Next</button>
              </div>
            </Tab>

            <Tab eventKey="Preview" title="Confirm Details">
              <div>
                <h3 style={{ color: "#3BB4A1", marginBottom: "20px" }} className="link w-100 text-center">Preview of the Form</h3>
                <div className="previewForm" style={{ fontFamily: "Montserrat, sans-serif", color: "#2d2d2d", marginBottom: "20px" }}>
                  <div style={{ display: "flex", width: "70vw", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }} className="link m-sm-0"><span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Name:</span><span style={{ flex: 2 }}>{form.name || "Yet to be filled"}</span></div>
                  <div style={{ display: "flex", width: "70vw", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }} className="link"><span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Email ID:</span><span style={{ flex: 2 }}>{form.email || "Yet to be filled"}</span></div>
                  {/* ... other preview fields ... */}
                </div>
                <div className="row">
                  <button onClick={handleSubmit} style={{ backgroundColor: "#3BB4A1", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }} className="w-50 d-flex m-auto text-center align-content-center justify-content-center">{saveLoading ? <Spinner animation="border" variant="primary" /> : "Submit"}</button>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Register;
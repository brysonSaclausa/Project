import React, { useState, useEffect } from "react";
import MiniDrawer from "../../Sidebar";
import PersonIcon from "@material-ui/icons/Person";
import CreateGoals from "../../WithOrganizations/CreateGoals/CreateGoals";
import firebase from "../../../../Config/FirebaseConfig";
import { useHistory } from "react-router-dom";

const goalsInput = {
  eventName: "",
  description: "",
  dificulty: "",
  endDate: "",
  investMin: "",
  investMax: "",
  rewardMin: "",
  rewardMax: "",
  startDate: "",
  category: "",
  numberOfDays:''
};

const WithOutOrgGoalsCreate = () => {
  const history = useHistory();
  const [inputValues, setInputValues] = useState(goalsInput);
  const [imgUrl, setImgurl] = useState("");
  const [imgName, setImgName] = useState("");
  const [local, setLocal] = useState("");
  // loading
  let [loading, setLoading] = useState(false);
  const handleGoals = (event) => {
    setInputValues({ ...inputValues, [event.target.name]: event.target.value });
  };

  const handleGoalImg = (event) => {
    const url = URL.createObjectURL(event.target.files[0]);
    const goalImgName = event.target.files[0].name;
    setImgurl(url);
    setImgName(goalImgName);
    setLocal(event.target.files[0]);
  };
  // firebase storage ref
  const storage = firebase.storage();
  let createStorageRef = () => storage.ref(`goalsImages/${imgName}`).put(local);
  let downLoad = () => storage.ref(`goalsImages/${imgName}`).getDownloadURL();

  // firebase database reference
  const db = firebase.database();
  const goalsRef = db.ref(`withoutOrganization/goals`);
  const pushGoal = goalsRef.push();
  const ref = db.ref(`withoutOrganization/categories`);
  let [dbCategory, setDbCategory] = useState([]);

  const getCategories = () => {
    ref.on("value", (snapshot) => {
      let categoryArray = [];
      snapshot.forEach((data) => {
        let resData = data.val();
        let dataKey = data.key;
        resData.id = dataKey;
        categoryArray.push(resData);
      });
      setDbCategory(categoryArray);
    });
  };

  useEffect(() => {
    getCategories();
    return () => {
      getCategories();
    };
  }, []);

  // add goals in database

  const handleAddGoals = (e) => {
    e.preventDefault();
    setLoading(true);
    createStorageRef().then(() => {
      downLoad().then((url) => {
        pushGoal
          .set({
            inputValues,
            url,
            peopleJoined: 0,
          })
          .then(() => {
            setLoading(false);
            history.push(`/without-organization/dashboard`);
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
          });
      });
    });
    setInputValues(goalsInput);
    setImgurl("");
  };

  return (
    <div>
      <div className="createGoals_container">
        <div className="createGoals_md">
          <div className="dashboard_left_content">
            <MiniDrawer withOutOrg />
          </div>
          <div className="create_goals_right_content">
            <div className="top_route_head">
              <p className="top_route_icon">
                <PersonIcon />
              </p>
              <p style={{ marginLeft: "10px" }}>Goals</p>
            </div>
            <div className="create_goals_box_main">
              <CreateGoals
                handleAddGoals={handleAddGoals}
                handleInputGoals={handleGoals}
                handleGoalImg={handleGoalImg}
                inputValues={inputValues}
                imgUrl={imgUrl}
                loading={loading}
                btnValue="Add goals"
                backArrowPathId="/without-organization/dashboard"
                dbCategory={dbCategory}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithOutOrgGoalsCreate;

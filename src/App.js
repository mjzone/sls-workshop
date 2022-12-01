import './App.css';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { ButtonGroup } from 'react-bootstrap';
import { InputGroup } from 'react-bootstrap';
import { FormControl } from 'react-bootstrap';
import { Auth, API } from "aws-amplify";

const NOTSIGNIN = 'You are NOT logged in';
const SIGNEDIN = 'You have logged in successfully';
const SIGNEDOUT = 'You have logged out successfully';
const WAITINGFOROTP = 'Enter OTP number';
const VERIFYNUMBER = 'Verifying number (Country code +XX needed)';

function App() {
  const [message, setMessage] = useState('Welcome to Demo');
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [otp, setOtp] = useState('');
  const [number, setNumber] = useState('');
  const password = Math.random().toString(10) + 'Abc#';
  const [userProfile, setUserProfile] = useState({ name: "", nic: "", address: "" });
  const userAPIName = "UserAPI";
  const userRootPath = "/users";

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = () => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        setUser(user);
        setMessage(SIGNEDIN);
        setSession(null);
      })
      .catch((err) => {
        console.error(err);
        setMessage(NOTSIGNIN);
      });
  };

  const signOut = () => {
    if (user) {
      Auth.signOut();
      setUser(null);
      setOtp('');
      setMessage(SIGNEDOUT);
    } else {
      setMessage(NOTSIGNIN);
    }
  };

  const signIn = () => {
    setMessage(VERIFYNUMBER);
    Auth.signIn(number)
      .then((result) => {
        setSession(result);
        setMessage(WAITINGFOROTP);
      })
      .catch((e) => {
        if (e.code === 'UserNotFoundException') {
          signUp();
        } else if (e.code === 'UsernameExistsException') {
          setMessage(WAITINGFOROTP);
          signIn();
        } else {
          console.log(e.code);
          console.error(e);
        }
      });
  };

  const signUp = async () => {
    const result = await Auth.signUp({
      username: number,
      password,
      attributes: {
        phone_number: number,
      },
    }).then(() => signIn());
    return result;
  };

  const verifyOtp = () => {
    Auth.sendCustomChallengeAnswer(session, otp)
      .then((user) => {
        setUser(user);
        setMessage(SIGNEDIN);
        setSession(null);
      })
      .catch((err) => {
        setMessage(err.message);
        setOtp('');
        console.log(err);
      });
  };

  const getPayload = async (data = {}) => {
    return {
      body: data,
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
      }
    };
  }

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!userProfile.name || !userProfile.nic || !userProfile.address) {
        return;
      }
      const payload = await getPayload(userProfile);
      await API.post(userAPIName, userRootPath, payload);
    } catch (err) {
      console.log('error creating user profile:', err);
    }
  }

  return (
    <div className='App'>
      <header className='App-header'>
        <p>{message}</p>
        {!user && !session && (
          <div>
            <InputGroup className='mb-3'>
              <FormControl
                placeholder='Phone Number (+XX)'
                onChange={(event) => setNumber(event.target.value)}
              />
            </InputGroup>
            <Button variant='outline-secondary'
              onClick={signIn}>
              Get OTP
            </Button>
          </div>
        )}
        {!user && session && (
          <div>
            <InputGroup className='mb-3'>
              <FormControl
                placeholder='Your OTP'
                onChange={(event) => setOtp(event.target.value)}
                value={otp}
              />
            </InputGroup>
            <Button variant='outline-secondary'
              onClick={verifyOtp}>
              Confirm
            </Button>
          </div>
        )}
        {user && (
          <form className="form-wrapper" onSubmit={handleUserFormSubmit}>
            <div className="form-fields">
              <div className="name-form">
                <p><label htmlFor="name">Name</label></p>
                <p><input
                  name="name"
                  type="name"
                  placeholder="Your name"
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  required
                /></p>
              </div>
              <div className="author-form">
                <p><label htmlFor="nic">NIC</label></p>
                <p><input
                  name="nic"
                  type="text"
                  placeholder="Your NIC"
                  onChange={(e) => setUserProfile({ ...userProfile, nic: e.target.value })}
                  required
                /></p>
              </div>
              <div className="description-form">
                <p><label htmlFor="description">Address</label></p>
                <p><textarea
                  name="address"
                  type="text"
                  rows="8"
                  placeholder="Your address"
                  onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                  required
                /></p>
              </div>
              <div className="submit-form">
                <button className="btn" type="submit">Save User</button>
              </div>
            </div>
          </form>
        )}
        <div>
          <ButtonGroup>
            <Button variant='outline-primary' onClick={verifyAuth}>
              Am I sign in?
            </Button>
            <Button variant='outline-danger' onClick={signOut}>
              Sign Out
            </Button>
          </ButtonGroup>
        </div>
      </header>
    </div>
  );
}
export default App;
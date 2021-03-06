import React from 'react';
import { Route, useHistory, Switch, Redirect } from "react-router-dom";
import API from '../../api/API';
import NavBar from '../NavBar';
import UserRent from './UserRent';
import UserRentHistory from './UserRentHistory';


export default function User({...rest}){
    const [username, setUsername] = React.useState("");
   
    const history = useHistory();
  
    React.useEffect(() => {
      API.isAuthenticated()
      .then((user) => {
        setUsername(user.username);
      }).catch((err) => {
        if (err.status && err.status === 401) {
          history.push("/login");
        }
      })
    }, [history]);
    
    return(
        <>
            <NavBar location={"/user"} username={username}></NavBar>
            <Switch>
                <Route exact path="/user/" 
                    render={(props) => (
                        <UserRent {...rest}></UserRent>
                    )}
                />
                <Route path="/user/history" component={UserRentHistory}/>
                <Route><Redirect to="/user/"/></Route>
            </Switch>
        </>
    );
}

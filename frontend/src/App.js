import React, {Component} from 'react';
import './App.css';
import {Row, Col} from 'reactstrap';
import {Container, Navbar, NavbarBrand} from 'reactstrap';
import {ListGroup, ListGroupItem} from 'reactstrap';

class App extends Component {
    render() {
        return (
            <Row>
                <Col md="3">
                    <Container>
                        <h1>Censorship Board</h1>
                        <div
                            style={{
                                width: '200px',
                                height: '200px',
                                backgroundColor: '#0099FF',
                                margin: '0 auto'
                            }}
                        >
                            &nbsp;
                        </div>
                    </Container>
                    <ListGroup flush>
                        <ListGroupItem disabled tag="a" href="#">
                            Current inaccessible sites
                            {/* List the latest status */}
                        </ListGroupItem>
                        <ListGroupItem tag="a" href="#">
                            List of monitored sites
                        </ListGroupItem>
                        <ListGroupItem tag="a" href="#">
                            Site downtime summary
                        </ListGroupItem>
                        <ListGroupItem tag="a" href="#">
                            Site downtime history
                        </ListGroupItem>
                    </ListGroup>
                </Col>
                <Col md="9">
                    <Navbar color="light" light expand="md">
                        <NavbarBrand href="/">Censorship Board</NavbarBrand>
                    </Navbar>
                </Col>
            </Row>
        );
    }
}

export default App;

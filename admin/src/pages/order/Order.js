import { faEye } from '@fortawesome/free-regular-svg-icons';
import { faEdit, faEllipsisH, faSearch, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Card, Col, Container, Dropdown, Nav, Row, Table } from '@themesberg/react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { apiUrl } from '../../enviroment';
import { request } from '../../helper/request.helper';
import { Routes } from "../../routes";
import Loading from '../layout/Loading';
import OrderEdit from './OrderEdit';

const access_token = localStorage.getItem("token");
export default () => {
  let history = useHistory();
  const [orders, setOrders] = useState({
    total: 0,
    data: []
  });
  const [textSearch, setTextSearch] = useState("");
  const [locationData, setLocationData] = useState();
  const [activePage, setActivePage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  let searchLocation = async () => {
    let responsive = await axios.get('https://provinces.open-api.vn/api/?depth=2');
    if (responsive.status === 200) {
      setLocationData(responsive.data)
    }
  }
  useEffect(() => {
    search("")
  }, [activePage, limit])
  const search = (text) => {
    setLoading(true);
    axios({
      method: 'GET',
      url: `${apiUrl}/Carts`,
      params: {
        access_token: access_token,
        filter: {
          limit: limit,
          skip: limit * (activePage - 1),
          include: 'account',
          where: {
            code: {
              regexp: `/.*${text}.*/i`
            }
          }
        }
      }
    }).then((result) => {
      setLoading(false);
      setOrders(result.data);
    }).catch(err => {
      setLoading(false);
    })
  }

  useEffect(() => {
    searchLocation()
  }, []);


  let routerDetailOrder = (data) => {
    history.push({
      pathname: Routes.OrderDetail.path,
      state: data
    })
  }

  return (
    <>
    <Loading loading={loading} />
      <Container>
        <Row className="mb-4" >
          <Col className='col-9' >
            <input placeholder='T??m ki???m ...'
              style={{
                width: '100%',
                padding: 10

              }}
              value={textSearch}
              onChange={e => setTextSearch(e.target.value)}
            />
          </Col>
          <Col className='col-3' >
            <Button variant="success" onClick={() => search(textSearch)} >
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </Col>
        </Row>
        <Row>
          <Card border="light" className="table-wrapper table-responsive shadow-sm">
            <Card.Body className="pt-0">
              <Table hover className="user-table align-items-center">
                <thead>
                  <tr>
                    <th className="border-bottom">#</th>
                    <th className="border-bottom">M?? ????n h??ng</th>
                    <th className="border-bottom">T???nh/Th??nh ph???</th>
                    <th className="border-bottom">Gi?? (VN??)</th>
                    <th className="border-bottom">Tr???ng th??i</th>
                    <th className="border-bottom">Ng??y</th>
                    <th className="border-bottom">C??i ?????t</th>
                  </tr>
                </thead>
                <tbody>
                  {orders && orders.data.map((orderItem, index) => {
                    return (
                      <TableItem index={index + 1} order={orderItem} key={index}
                        routerDetailOrder={routerDetailOrder}
                        search={search}
                        locationData={locationData}
                      />
                    )
                  })}
                </tbody>
              </Table>
            </Card.Body>
            <Card.Footer className="border-0 d-lg-flex align-items-center justify-content-between">
              <Nav>
                <div className='wrapper-paginate'>
                  {orders && <Pagination
                    className="mb-2 mb-lg-0"
                    activePage={activePage}
                    itemsCountPerPage={limit | 5}
                    totalItemsCount={orders.total}
                    pageRangeDisplayed={3}
                    onChange={value => setActivePage(value)}
                  />}
                </div>
              </Nav>
              <small className="fw-bold">
                Hi???n th??? <select value={limit} onChange={e => setLimit(e.target.value)} >
                  <option value={5} >5</option>
                  <option value={10} >10</option>
                  <option value={15} >15</option>
                </select> trong t???ng s??? <b>{orders.total}</b> m???c
              </small>
            </Card.Footer>
          </Card>
        </Row>
      </Container>
    </>
  )
}


function TableItem({ index, order, routerDetailOrder, search, locationData }) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  let { addToast } = useToasts();
  let city = locationData?.filter(item => item.code == order?.city)[0]
  let district = city?.districts?.filter(item => item.code == order?.district)[0]?.name;
  let deleteOrder = () => {
    request({
      method: 'DELETE',
      url: `Orders/${order.id}`,
      params: {
        filter: {
          include: 'account'
        }
      }
    }).then(() => {
      search("");
      addToast('X??a ????n h??ng th??nh c??ng!', { appearance: 'success', autoDismiss: 1000 })
    }).catch(error => {
      addToast("Error", { appearance: 'error', autoDismiss: 2000 });

    })
  }
  const currencyFormat = (num) => {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + ' VN??'
  }
  return (
    <>
      <OrderEdit show={show} handleClose={handleClose} order={order} search={search} />
      <tr>
        <td>
          <Card.Link href="#" className="text-primary fw-bold">{index}</Card.Link>
        </td>
        <td>
          <Card.Link href="#" className="text-primary fw-bold">{order?.code}</Card.Link>
        </td>
        <td>
          {city?.name} -  {district}
        </td>
        <td>{currencyFormat(order.price)}</td>
        <td>{order.status}</td>
        <td>{moment(order?.createdAt).format("HH:mm DD-MM-YYYY")}</td>
        <td>
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle as={Button} split variant="link" className="text-dark m-0 p-0">
              <span className="icon icon-sm">
                <FontAwesomeIcon icon={faEllipsisH} className="icon-dark" />
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => routerDetailOrder(order)} >
                <FontAwesomeIcon icon={faEye} className="me-2" /> Xem
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setShow(true)} >
                <FontAwesomeIcon icon={faEdit} className="me-2" /> S???a
              </Dropdown.Item>
              <Dropdown.Item className="text-danger" onClick={() => deleteOrder(order.id)}  >
                <FontAwesomeIcon icon={faTrashAlt} className="me-2" /> X??a
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </td>

      </tr>
    </>
  );
}   

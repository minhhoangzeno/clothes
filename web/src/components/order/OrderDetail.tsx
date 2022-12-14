import {
  Button,
  Container,
  Form,
  Image,
  InputGroup,
  Row,
} from "@themesberg/react-bootstrap";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { apiUrl } from "../../enviroments";
import { OrderProductInterface } from "../../models/order-product.interface";
import { OrderInterface } from "../../models/order.interface";

const access_token = localStorage.getItem("token");
export default () => {
  let location = useLocation();
  let orderId = location.state;
  const [order, setOrder] = useState<OrderInterface>();
  const [orderProducts, setOrderProducts] = useState<OrderProductInterface[]>(
    []
  );
  const [locationData, setLocationData] = useState<any>();
  let history = useHistory();
  useEffect(() => {
    searchLocation();
  }, []);
  let searchLocation = async () => {
    let responsive = await axios.get(
      "https://provinces.open-api.vn/api/?depth=2"
    );
    if (responsive.status === 200) {
      setLocationData(responsive.data);
    }
  };
  useEffect(() => {
    search();
    searchOrder();
  }, [orderId]);
  const search = () => {
    axios({
      method: "GET",
      url: `${apiUrl}/CartClothes`,
      params: {
        access_token,
        filter: {
          where: {
            orderId: orderId,
          },
          include: "clothes",
        },
      },
    })
      .then((result) => {
        setOrderProducts(result.data);
      })
      .catch((err) => console.log(err));
  };

  const searchOrder = () => {
    axios({
      method: "GET",
      url: `${apiUrl}/Carts/${orderId}`,
      params: {
        access_token,
        filter: {
          include: ["clothes", "account"],
        },
      },
    })
      .then((result) => {
        setOrder(result.data);
      })
      .catch((err) => console.log(err));
  };
  let city = locationData?.filter((item: any) => item.code == order?.city)[0];
  let district = city?.districts?.filter(
    (item: any) => item.code == order?.district
  )[0]?.name;
  const currencyFormat = (num: number) => {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + " VN??";
  };

  return (
    <Container>
      <Row className="mt-4">
        <Form>
          <div className="order__detail feedback pt-4">
            <div style={{ height: 15 }}></div>
            <label>Th??ng tin ng?????i d??ng</label>
            <table style={{ marginTop: 15 }}>
              <thead>
                <th>H??? t??n</th>
                <th>S??? ??i???n tho???i</th>
                <th>Email</th>
                <th>T???nh/Th??nh ph???</th>
                <th>?????a ch??? g???i</th>
              </thead>
              <tbody>
                <td>
                  {order?.firstName} - {order?.lastName}
                </td>
                <td>{order?.phoneNumber}</td>
                <td>{order?.email}</td>
                <td>
                  {city?.name} - {district}
                </td>
                <td>{order?.address}</td>
              </tbody>
            </table>
            <div style={{ height: 50 }}></div>
            <label>Th??ng tin s???n ph???m</label>
            <table style={{ marginTop: 15 }}>
              <thead>
                <th>T??n h??ng</th>
                <th>Size</th>
                <th>Lo???i</th>
                <th>H??nh ???nh</th>
                <th>????n gi??</th>
                <th>S??? l?????ng</th>
                <th>Th??nh ti???n</th>
              </thead>
              <tbody>
                {orderProducts?.map((orderProduct, index) => {
                  return (
                    <tr key={index}>
                      <td>{orderProduct?.clothes?.title}</td>
                      <td>{orderProduct?.clothes?.size}</td>
                      <td>{orderProduct?.clothes?.type}</td>
                      <td>
                        <Image
                          src={orderProduct?.clothes?.photoURL}
                          alt="photoURL"
                          className="user-avatar xl-avatar"
                        />
                      </td>
                      <td>{currencyFormat(orderProduct?.clothes?.price)}</td>
                      <td>{orderProduct?.amount}</td>
                      <td>
                        {currencyFormat(
                          Number(
                            orderProduct?.clothes?.price * orderProduct?.amount
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ height: 50 }}></div>
          <label>Tr???ng th??i</label>
          <InputGroup>
            <Form.Control
              autoFocus
              required
              type="text"
              value={order?.status}
              disabled
            />
          </InputGroup>
          <div style={{ height: 50 }}></div>
          <label>T???ng Ti???n</label>
          <InputGroup>
            <Form.Control
              autoFocus
              required
              type="text"
              value={currencyFormat(Number(order?.price))}
              disabled
            />
          </InputGroup>
          <div style={{ height: 50 }}></div>
          <label>Ghi ch??</label>
          <InputGroup>
            <Form.Control
              autoFocus
              required
              type="text"
              value={order?.note}
              disabled
            />
          </InputGroup>
          <div style={{ width: 200 }}>
            <Button
              variant="secondary"
              type="button"
              className="m-3"
              onClick={() => history.goBack()}
            >
              Quay l???i
            </Button>
          </div>
        </Form>
      </Row>
    </Container>
  );
};

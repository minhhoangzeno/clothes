import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { apiUrl } from "../enviroments";
import { OrderProductInterface } from "../models/order-product.interface";
import { Routes } from "../routes";

// const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || '') : null;
const access_token = localStorage.getItem("token");
export default function Checkout() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  let { addToast } = useToasts();
  const location = useLocation();
  const data: any = location.state;
  const [city, setCity] = useState<any[]>([]);
  const [district, setDistrict] = useState<any[]>([]);
  const [citySelect, setCitySelect] = useState<any>();
  const [districtSelect, setDistrictSelect] = useState<any>();
  const [show, setShow] = useState(false);
  const [code, setCode] = useState();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [checkPayment, setCheckPayment] = useState<boolean>(false);
  const user = useSelector((state: any) => state.auth.data);
  function makeid(length: number) {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
  useEffect(() => {
    searchLocation(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const history = useHistory();
  let searchLocation = async () => {
    if (user) {
      let responsive = await axios.get(
        "https://provinces.open-api.vn/api/?depth=2"
      );
      if (responsive.status === 200) {
        let cityDistricts = responsive.data.filter(
          (item: any) => item.code == user.city
        )[0];
        setCity(responsive.data);
        setCitySelect(user.city);
        setDistrict(cityDistricts?.districts);
        setDistrictSelect(user.district);
      }
    }
  };
  let handleSelectCity = (e: any) => {
    setCitySelect(e.target.value);
    let cityDistricts = city.filter((item) => item.code == e.target.value)?.[0];
    setDistrict(cityDistricts.districts);
    setDistrictSelect(cityDistricts.districts?.[0]?.code);
  };
  let handleSelectDistrict = (e: any) => {
    setDistrictSelect(e.target.value);
  };
  const currencyFormat = (num: any) => {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + " VN??";
  };
  console.log("data",data);
  
  const checkout = async (form: any) => {
    axios({
      method: "PATCH",
      url: `${apiUrl}/Carts/${data?.cartId}`,
      params: {
        access_token,
      },
      data: {
        status: "???? t???o ????n",
        price: data?.price,
        inputPrice: data?.inputPrice,
        code: makeid(4),
        city: citySelect,
        district: districtSelect,
        ...form,
      },
    })
      .then((result) => {
        if (!checkPayment) {
          setCode(result.data.code);
          setShow(true);
        } else if (checkPayment) {
          axios({
            method: "POST",
            url: `${apiUrl}/Orders/payment-order`,
            params: {
              access_token,
            },
            data: {
              amount: data?.price,
              orderType: "Thanh to??n ti???n h??ng",
              orderDescription: "Thanh to??n ti???n h??ng online qua ng??n h??ng NCB",
              bankCode: "NCB",
              language: "vn",
              idOrder: result.data.id,
            },
          })
            .then((res) => {
              window.open(res.data, "_self");
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => {
        console.log(err);
        addToast(`Failed!`, { appearance: "error", autoDismiss: true });
      });
  };
  return (
    <>
      <Header />
      <div className="checkout_area mt-50 mb-100">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-12 col-lg-7 pr-50">
              <div className="checkout_details_area clearfix">
                <h5>Th??ng tin</h5>
                <form action="#" method="post">
                  <div className="row">
                    <div className="col-md-6 pr-10 mb-4">
                      <label>H??? *</label>
                      <Controller
                        control={control}
                        name="firstName"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <input
                            className={
                              errors.firstName
                                ? "errorInput form-control"
                                : "form-control"
                            }
                            type="text"
                            name="firstName"
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={onBlur}
                            value={value}
                          />
                        )}
                        rules={{ required: true }}
                        defaultValue={user?.firstName}
                      />
                    </div>
                    <div className="col-md-6 pl-10 mb-4">
                      <label>T??n *</label>
                      <Controller
                        control={control}
                        name="lastName"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <input
                            className={
                              errors.lastName
                                ? "errorInput form-control"
                                : "form-control"
                            }
                            type="text"
                            name="lastName"
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={onBlur}
                            value={value}
                          />
                        )}
                        rules={{ required: true }}
                        defaultValue={user?.lastName}
                      />
                    </div>
                    <div className="width-full mb-4">
                      <label>Email *</label>
                      <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <input
                            className={
                              errors.lastName
                                ? "errorInput form-control"
                                : "form-control"
                            }
                            type="email"
                            name="email"
                            id="email"
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={onBlur}
                            value={value}
                          />
                        )}
                        rules={{ required: true }}
                        defaultValue={user?.email}
                      />
                    </div>
                    <div className="width-full mb-4">
                      <label>S??? ??i???n tho???i *</label>
                      <Controller
                        control={control}
                        name="phoneNumber"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <input
                            className={
                              errors.lastName
                                ? "errorInput form-control"
                                : "form-control"
                            }
                            type="number"
                            name="phoneNumber"
                            id="phoneNumber"
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={onBlur}
                            value={value}
                          />
                        )}
                        rules={{ required: true }}
                        defaultValue={user?.phoneNumber}
                      />
                    </div>
                    <div className="width-full mb-4">
                      <label>?????a ch??? *</label>
                      <Controller
                        control={control}
                        name="address"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <input
                            className={
                              errors.lastName
                                ? "errorInput form-control"
                                : "form-control"
                            }
                            type="text"
                            name="address"
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={onBlur}
                          />
                        )}
                        rules={{ required: true }}
                      />
                    </div>
                    <div className="col-md-6 pr-10 mb-4">
                      <label>T???nh/Th??nh ph??? *</label>
                      <select
                        onChange={(e) => handleSelectCity(e)}
                        value={citySelect}
                        className="form-control"
                      >
                        {city.map((item, index) => {
                          return (
                            <option key={index} value={item.code}>
                              {item.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="col-md-6 pl-10 mb-4">
                      <label>Qu???n/Huy???n *</label>
                      <select
                        onChange={(e) => handleSelectDistrict(e)}
                        value={districtSelect}
                        className="form-control"
                      >
                        {district?.map((item, index) => {
                          return (
                            <option key={index} value={item.code}>
                              {item.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="col-md-12 mb-4">
                      <label>Ghi ch??</label>
                      <Controller
                        control={control}
                        name="note"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <textarea
                            className="form-control"
                            name="address"
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={onBlur}
                            placeholder="Notes about your order, e.g. special notes for delivery."
                          />
                        )}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="checkout-content">
                <h5 className="title--">????n h??ng c???a b???n</h5>
                <div className="products">
                  <div className="products-data">
                    <h5>S???n ph???m:</h5>
                    {data?.orderProducts?.map(
                      (orderProduct: OrderProductInterface, index: number) => {
                        return (
                          <div
                            key={index}
                            className="single-products flex justify-between items-center mt-10"
                          >
                            <div>
                              {orderProduct.clothes.title} x{" "}
                              {orderProduct.amount}
                            </div>
                            <div className="font-bold">
                              {currencyFormat(
                                Number(
                                  orderProduct.amount *
                                    orderProduct.clothes.price
                                )
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
                <div className="order-total flex justify-between items-center mt-10">
                  <div>T???ng ti???n</div>
                  <div className="font-bold">
                    {currencyFormat(Number(data?.price))}
                  </div>
                </div>

                <div className="checkout-btn mt-30">
                  <div
                    onClick={handleSubmit(checkout)}
                    className="text-center alazea-btn w-100"
                  >
                    X??c nh???n
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Modal className="wrap-modal" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            T???o ????n h??ng <b>{code}</b> th??nh c??ng!
          </Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              handleClose();
              history.push(Routes.Dashboard.path);
            }}
          >
            X??c nh???n
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

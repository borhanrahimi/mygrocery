import PayNowButton from "../components/PayNowButton";
import { useAuth } from "../context/AuthContext";
// deliveryOption / discountCode should come from your UI state or CartContext

function CartPage() {
  const { user } = useAuth(); // user?._id
  // const [deliveryOption, setDeliveryOption] = useState("delivery" | "pickup");
  // const [discountCode, setDiscountCode] = useState("");

  return (
    <div>
      {/* ...cart UI... */}
      <PayNowButton
        userId={user?._id}
        deliveryOption={deliveryOption}
        discountCode={discountCode}
      />
    </div>
  );
}

export default CartPage;

const customers: Customer[] = [
  {
    externalId: "2001",
    email: "a@test.se",
    active: true,
    address: {
      city: "Stockholm",
      country: "Sweden",
    },
  },
  {
    externalId: "2002",
    email: "b@test.se",
    active: false,
    address: {
      city: "Malmö",
      country: "Sweden",
    },
  },
];

const payload: UpdatePayload = {
  externalId: "02002",
  email: " NEW@MAIL.SE ",
  city: "Gothenburg",
};

interface Customer {
  externalId: string;
  email: string;
  active: boolean;
  address: {
    city: string;
    country: string;
  };
}

type UpdatePayload = {
  externalId: string;
  email?: string;
  city?: string;
  country?: string;
};

type UpdateResponse = {
  success: boolean;
  customer?: Customer;
  message?: string;
};

function updateCustomer(
  customers: Customer[],
  payload: UpdatePayload,
): Customer | null {
  if (
    typeof payload.externalId !== "string" ||
    payload.externalId.trim() === ""
  ) {
    throw new Error("Customer external Id not valid");
  }

  const id = Number(payload.externalId);

  if (Number.isNaN(id)) {
    throw new Error("Id type not a valid Number");
  }

  if (
    payload.email !== undefined &&
    (typeof payload.email !== "string" || payload.email.trim() === "")
  ) {
    throw new Error("Email value is not valid");
  }

  if (
    payload.city !== undefined &&
    (typeof payload.city !== "string" || payload.city.trim() === "")
  ) {
    throw new Error("City input value is not valid");
  }

  const customer = customers.find((item) => Number(item.externalId) === id);

  if (!customer) {
    return null;
  }

  const result: Customer = {
    ...customer,
    ...(payload.email !== undefined && {
      email: payload.email.trim().toLowerCase(),
    }),
    address: {
      ...customer.address,
      ...(payload.city !== undefined && {
        city: payload.city.trim(),
      }),
    },
  };

  return result;
}

async function saveCustomer(
  customers: Customer[],
  payload: UpdatePayload,
): Promise<UpdateResponse> {
  try {
    const updatedCustomer = updateCustomer(customers, payload);
    if (!updatedCustomer) {
      return {
        success: false,
        message: "Customer not found",
      };
    }
    const savedCustomer = await sendCustomerToApi(updatedCustomer);
    return {
      success: true,
      customer: savedCustomer,
      message: "Customer updated",
    };
  } catch (error) {
    // console.log(error);
    throw error;
  }
}

async function sendCustomerToApi(customer: Customer): Promise<Customer> {
  try {
    if (customer.active !== true) {
      throw new Error("This customer is not active");
    }
    return customer;
  } catch (error) {
    // if (error instanceof Error) {
    //   console.log(error.message);
    // }
    throw error;
  }
}
async function run() {
  try {
    const result = await saveCustomer(customers, payload);
    console.log(result);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}

run();

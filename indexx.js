require("dotenv").config();
var exp = require("express");
const cors = require("cors");

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
var pool = require("./db");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("./cloudinary");
const upload = multer({
  storage: multer.memoryStorage(),
});
const app = exp();

// app.use(cors({
//   origin:"http://localhost:5173"
// }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://699898c5eaea9030307b8a6c--digi-menu-x.netlify.app",
      "https://digi-menu-x.netlify.app",
    ],
    credentials: true,
  }),
);
app.options("*", cors()); // 🔥 THIS IS IMPORTANT
// app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("<h1>NODE JS REST API</h1>");
});
app.get("/menu", async (req, res) => {
  var result = await pool.query("select * from menu");
  res.json({ menu: result.rows });
});

app.get("/menus/:menuId", async (req, res) => {
  var { id } = req.body;
  var result = await pool.query("select * from menu where mid=$1", [id]);
  res.json({ menu: result.rows });
});
//food select api:-
app.get("/foodcat", async (req, res) => {
  var result = await pool.query("select * from food_cat ");
  res.json({ food_cat: result.rows });
});

app.get("/food_catById", async (req, res) => {
  var { id } = req.body;
  var result = await pool.query("select * from food_cat where fid=$1", [id]);
  res.json({ food_cat: result.rows });
});
//qty select api:-
app.get("/qty", async (req, res) => {
  var result = await pool.query("select * from qty");
  res.json({ qty: result.rows });
});

app.get("/qtyById", async (req, res) => {
  var { id } = req.body;
  var result = await pool.query("select * from qty where qid=$1", [id]);
  res.json({ qty: result.rows });
});
//----------------------------------------------------------//
//delete api(menu):--
app.delete("/delmenuById", async (req, res) => {
  try {
    var { id } = req.body;
    var result = await pool.query("delete from menu where mid=$1 returning *", [
      id,
    ]);
    res.send({ status: "200", message: " delete success " });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//delecte api(food_cat):-
app.delete("/delfood_catById", async (req, res) => {
  try {
    var { id } = req.body;
    var result = await pool.query(
      "delete from food_cat where fid=$1 returning *",
      [id],
    );
    res.json({ status: "200", message: " delete success " });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//deledct api(qty):-
app.delete("/delqtyById", async (req, res) => {
  try {
    var { id } = req.body;
    var result = await pool.query("delete from qty where qid=$1 returning *", [
      id,
    ]);
    res.send({ status: "200", message: " delete success " });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//-----------------------------------------------------------------------------------
//insert api(menu):-
app.post("/addmenu", upload.single("image"), async (req, res) => {
  try {
    const { mname, price, fid, qid } = req.body;

    let imageUrl = "";

    if (req.file) {
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "menu_images" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            },
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await streamUpload();
      imageUrl = result.secure_url;
    }

    const newMenu = await pool.query(
      "INSERT INTO menu (mname, price, fid, qid, image) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [mname, price, fid, qid, imageUrl],
    );

    res.json({ status: 200, data: newMenu.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 500, message: "Server error" });
  }
});
// app.post("/addmenu", async (req, res) => {
//   try {
//     const { mname, price, fid, qid } = req.body;
//     var result = await pool.query(
//       "insert into menu (mname,price,fid,qid) values ($1,$2,$3,$4) returning *",
//       [mname, price, fid, qid],
//     );
//     res.send({ status: "200", message: "save success" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("server error");
//   }
// });
//insert api(food_cat):-
app.post("/addfood_cat", async (req, res) => {
  try {
    // const {fid,category}=req.body;
    const { category } = req.body;
    var result = await pool.query(
      "insert into food_cat(category) values ($1) returning *",
      [category],
    );
    res.send({ status: "200", message: "save success" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//insert api(qty):-
app.post("/addqty", async (req, res) => {
  try {
    // const {qid,size}=req.body;
    const { size } = req.body;
    var result = await pool.query(
      "insert into qty(size) values ($1) returning *",
      [size],
    );
    res.send({ status: "200", message: "save success" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//--------------------------------------------------------------------------------------------------------------
//update api(menu):-
app.put("/updatemenuById", async (req, res) => {
  try {
    const { id, mname, price, fid, qid } = req.body;
    const result = await pool.query(
      "update menu set mname=$1,price=$2,fid=$3,qid=$4 where mid=$5 returning *",
      [mname, price, fid, qid, id],
    );
    res.send({ status: "200", message: "update success" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//update api(food_cat):-
app.put("/updatefood_catById", async (req, res) => {
  try {
    const { fid, category } = req.body;
    const result = await pool.query(
      "update food_cat set category=$1 where fid=$2 returning *",
      [category, fid],
    );
    res.send({ status: "200", message: "update success" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//update api(qty):-
app.put("/updatemenuById", upload.single("image"), async (req, res) => {
  try {
    const { id, mname, price, fid, qid, oldImage } = req.body;

    let imageUrl = oldImage;

    if (req.file) {
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "menu_images" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            },
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await streamUpload();
      imageUrl = result.secure_url;
    }

    await pool.query(
      "UPDATE menu SET mname=$1, price=$2, fid=$3, qid=$4, image=$5 WHERE mid=$6",
      [mname, price, fid, qid, imageUrl, id],
    );

    res.json({ status: 200, message: "Updated Successfully" });
  } catch (err) {
    res.status(500).json({ status: 500, message: "Server error" });
  }
});

// app.put("/updateqtyById", async (req, res) => {
//   try {
//     const { qid, size } = req.body;
//     const result = await pool.query(
//       "update qty set size=$1 where qid=$2 returning *",
//       [size, qid],
//     );
//     res.send({ status: "200", message: "update success" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("server error");
//   }
// });
//menu,foodcat,qty items count for dashboard
app.get("/cnt", async (req, res) => {
  try {
    var result = await pool.query(
      "SELECT (SELECT COUNT(*) FROM menu) AS menu_count, (SELECT COUNT(*) FROM food_cat) AS food_cat_count,(SELECT COUNT (*) FROM qty) AS qty_count;",
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//SQL QUERY TO REMOVE UNECCCERRY DUPLICATE
app.get("/menucard", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.mid, m.mname, m.price,
             f.category,
             q.size,
             m.image
      FROM menu m
      JOIN food_cat f ON f.fid = m.fid
      JOIN qty q ON q.qid = m.qid
      ORDER BY m.mid DESC
    `);

    res.json({ status: 200, menu: result.rows });
  } catch (err) {
    res.status(500).json({ status: 500, message: "Server error" });
  }
});

//------------------------------------------ jwt_Authentication------------------------------

app.get("/api/auth/check", verifyToken, (req, res) => {
  res.json({ ok: true, role: req.user.role, username: req.user.username });
});

//authentications api
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  // console.log("=======", username, password)
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ status: 401, error: "Invalid credentials" });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: 401, error: "Invalid credentials" });
    }
    //     // ✅ Login successful
    //   //   res.json({
    //   //     status: 200,
    //   //     message: "Login successful",
    //   //     username: user.username,
    //   //   });
    //   // } catch (err) {
    //   //   console.error(err);
    //   //   res.status(500).json({ status: 500, error: "Server error" });
    //   // }
    // });
    // ✅ JWT TOKEN GENERATE
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    // ✅ TOKEN COOKIE ME STORE
    res.cookie("token", token, {
      httpOnly: true,
      // sameSite: "strict",
      // secure: false, // https ho to true
      sameSite: "none",
      secure: true,
    });

    res.json({ status: 200, message: "Login success", role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // future use
    next(); // allow request
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true in production
  });
  res.json({ message: "Logged out" });
});

//-------------------------------------tablebill_api-----------------//

// GET: Load an existing OPEN bill for a specific table
app.get("/tablebill/:tableId", async (req, res) => {
  const { tableId } = req.params;
  try {
    const result = await pool.query(
      "SELECT items FROM bills WHERE table_id = $1 AND status = 'OPEN' LIMIT 1",
      [tableId],
    );
    res.json(
      result.rows.length > 0 ? { items: result.rows[0].items } : { items: [] },
    );
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST: Save Bill (Keeps status as OPEN)
app.post("/tablebill/save", async (req, res) => {
  const { table_id, items, total } = req.body;
  try {
    const check = await pool.query(
      "SELECT bill_id FROM bills WHERE table_id = $1 AND status = 'OPEN'",
      [table_id],
    );
    let billId;

    if (check.rows.length > 0) {
      billId = check.rows[0].bill_id;

      await pool.query(
        "UPDATE bills SET items = $1, total = $2, updated_at = NOW() WHERE bill_id = $3",
        [JSON.stringify(items), total, billId],
      );
    } else {
      const insertResult = await pool.query(
        "INSERT INTO bills (table_id, items, total, status) VALUES ($1, $2, $3, 'OPEN') RETURNING bill_id",
        [table_id, JSON.stringify(items), total],
      );

      billId = insertResult.rows[0].bill_id;
      // 🔥 Set table occupied
      await client.query(
        "UPDATE tables SET status = 'occupied' WHERE id = $1",
        [table_id],
      );
    }
    res.json({ message: "Bill Saved", bill_id: billId });

    // res.send("Bill Saved");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST:  Close Bill (Marks as CLOSED)
app.post("/tablebill/close", async (req, res) => {
  const { table_id } = req.body;
  try {
    await pool.query(
      "UPDATE bills SET status = 'CLOSED' WHERE table_id = $1 AND status = 'OPEN'",
      [table_id],
    );

    // 🔥 Set table available
    await client.query("UPDATE tables SET status = 'available' WHERE id = $1", [
      table_id,
    ]);

    res.send("Bill Closed");
  } catch (err) {
    res.status(500).send(err.message);
  }
});
// Add this to your Express server file
app.get("/tables", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tables ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/kitchen/orders", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT bill_id, table_id, items, order_status FROM bills WHERE status='OPEN'",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
app.put("/kitchen/status/:id", async (req, res) => {
  const { status } = req.body;

  await pool.query("UPDATE bills SET order_status=$1 WHERE bill_id=$2", [
    status,
    req.params.id,
  ]);

  res.send("Status Updated");
});

// customer api
app.get("/api/customers", async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const result = await pool.query(
        `SELECT * FROM customers 
         WHERE id=$1 AND deleted_at IS NULL`,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Customer not found" });
      }

      return res.json(result.rows[0]);
    }

    const result = await pool.query(
      `SELECT * FROM customers 
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET_CUSTOMERS_ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const body = req.body;

    // AI tool call support
    const vapiArgs = body?.message?.toolCalls?.[0]?.function?.arguments;

    const name = vapiArgs?.name || body.name;
    const rawPhone = vapiArgs?.phone || body.phone;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Valid name is required" });
    }

    const phone =
      rawPhone && String(rawPhone).trim().length > 0
        ? String(rawPhone).trim()
        : null;

    const result = await pool.query(
      `INSERT INTO customers (name, phone)
       VALUES ($1, $2)
       RETURNING *`,
      [name.trim(), phone],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Phone already exists" });
    }

    console.error("CREATE_CUSTOMER_ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/customers", async (req, res) => {
  try {
    const { id, name, phone } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const check = await pool.query(`SELECT * FROM customers WHERE id=$1`, [id]);

    if (check.rows.length === 0 || check.rows[0].deleted_at) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const result = await pool.query(
      `UPDATE customers
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name?.trim() || null, phone?.trim() || null, id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE_CUSTOMER_ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/customers", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const result = await pool.query(
      `UPDATE customers
       SET deleted_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("DELETE_CUSTOMER_ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// app.listen(3000, "127.0.0.1", () => {
//   console.log("Listening on 127.0.0.1:3000");
// });
// ("0.0.0.0");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

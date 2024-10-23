const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');  // Importar la conexión

const app = express();

// Configuración de EJS como motor de vistas
app.set('view engine', 'ejs');

// Middleware para manejar formularios
app.use(bodyParser.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static('public'));

// Ruta para mostrar formulario de empresas y sucursales
app.get('/', async (req, res) => {
  try {
    const [empresas] = await pool.query('SELECT * FROM gen_empresas');
    res.render('index', { empresas });
  } catch (err) {
    res.send('Error al cargar los datos');
  }
});


// RUTAS PARA MANEJAR EL REGISTRO DE EMPRESAS
app.post('/addEmpresa', async (req, res) => {
  const { idEmpresa, nombre, direccion, direccionfacturacion, representantelegal, telefono, correoelectronico, codigopostal, estado, principal, adiciono } = req.body;
  try {
    await pool.query(
      `INSERT INTO gen_empresas (idEmpresa, nombre, direccion, direccionfacturacion, representantelegal, telefono, correoelectronico, codigopostal, estado, principal, adiciono, fechaadicion) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, 
      [idEmpresa, nombre, direccion, direccionfacturacion, representantelegal, telefono, correoelectronico, codigopostal, estado, principal, adiciono]
    );
    res.redirect('/');
  } catch (err) {
    res.send('Error al registrar la empresa');
  }
});



// VER SUCURSALES DE UNA EMPRESA
app.get('/empresa/:idEmpresa/sucursales', async (req, res) => {
    const { idEmpresa } = req.params;
    
    try {
      // Obtener la empresa seleccionada
      const [empresa] = await pool.query('SELECT * FROM gen_empresas WHERE idEmpresa = ?', [idEmpresa]);
      
      // Obtener las sucursales asociadas a esa empresa
      const [sucursales] = await pool.query('SELECT * FROM inv_sucursales WHERE idEmpresa = ?', [idEmpresa]);
      
      // Renderizar la vista para mostrar las sucursales
      res.render('sucursales', { empresa: empresa[0], sucursales });
    } catch (err) {
      res.send('Error al cargar las sucursales');
    }
  });

  // RUTA PARA MOSTRAR EL FORMULARIO DE AGREGAR SUCUSRSAELS
app.get('/empresa/:idEmpresa/agregarSucursal', (req, res) => {
    const { idEmpresa } = req.params;
    res.render('agregarSucursal', { idEmpresa });
  });
  
  // Ruta para manejar el POST de una nueva sucursal
  app.post('/empresa/:idEmpresa/agregarSucursal', async (req, res) => {
    const { idEmpresa } = req.params;
    const { idSucursal, descripcion, direccion, telefono, encargado, estado } = req.body;
  
    try {
      await pool.query(
        `INSERT INTO inv_sucursales (idSucursal, idEmpresa, descripcion, direccion, telefono, encargado, estado) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [idSucursal, idEmpresa, descripcion, direccion, telefono, encargado, estado]
      );
      res.redirect(`/empresa/${idEmpresa}/sucursales`);
    } catch (err) {
      res.send('Error al agregar la sucursal');
    }
  });

  // Mostrar formulario para agregar una nueva sucursal
  app.get('/empresa/:idEmpresa/sucursales/agregar', async (req, res) => {
    const { idEmpresa } = req.params;
  
    // Supongamos que estás obteniendo los datos de la empresa desde la base de datos
    try {
      const empresa = await pool.query('SELECT * FROM empresas WHERE idEmpresa = ?', [idEmpresa]);
      
      // Asegúrate de que los datos de la empresa se están pasando a la vista
      res.render('agregarSucursal', { empresa: empresa[0] });  // Enviando los datos de la empresa
    } catch (err) {
      res.status(500).send('Error al cargar los datos de la empresa');
    }
  });
  

  
  // Manejar la solicitud POST para agregar una nueva sucursal
  app.post('/empresa/:idEmpresa/sucursal/agregar', async (req, res) => {
    const { idEmpresa } = req.params;
    const { idSucursal, descripcion, direccion, telefono, encargado, estado } = req.body;
  
    try {
      await pool.query(
        'INSERT INTO inv_sucursales (idSucursal, idEmpresa, descripcion, direccion, telefono, encargado, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [idSucursal, idEmpresa, descripcion, direccion, telefono, encargado, estado]
      );
  
      res.redirect(`/empresa/${idEmpresa}/sucursales`);
    } catch (err) {
      res.send('Error al agregar la sucursal.');
    }
  });

  /////////////
  // Ruta para mostrar el formulario de edición de una sucursal
app.get('/empresa/:idEmpresa/sucursal/:idSucursal/editar', async (req, res) => {
  const { idEmpresa, idSucursal } = req.params;

  try {
    // Obtener los detalles de la sucursal que se desea editar
    const [sucursal] = await pool.query('SELECT * FROM inv_sucursales WHERE idSucursal = ? AND idEmpresa = ?', [idSucursal, idEmpresa]);

    if (sucursal.length > 0) {
      res.render('editarSucursal', {
        sucursal: sucursal[0], // Pasar los datos de la sucursal a la vista
        idEmpresa
      });
    } else {
      res.send('Sucursal no encontrada.');
    }
  } catch (err) {
    res.send('Error al obtener los detalles de la sucursal.');
  }
});

// Ruta para manejar la actualización de los datos de la sucursal
app.post('/empresa/:idEmpresa/sucursal/:idSucursal/editar', async (req, res) => {
  const { idEmpresa, idSucursal } = req.params;
  const { descripcion, direccion, telefono, encargado, estado } = req.body;

  try {
    // Actualizar la sucursal en la base de datos
    await pool.query(
      'UPDATE inv_sucursales SET descripcion = ?, direccion = ?, telefono = ?, encargado = ?, estado = ? WHERE idSucursal = ? AND idEmpresa = ?',
      [descripcion, direccion, telefono, encargado, estado, idSucursal, idEmpresa]
    );

    res.redirect(`/empresa/${idEmpresa}/sucursales`);
  } catch (err) {
    res.send('Error al actualizar la sucursal.');
  }
});
/////////
  
  

  // Mostrar página para confirmar la eliminación de una sucursal
 app.get('/empresa/:idEmpresa/sucursal/:idSucursal/eliminar', async (req, res) => {
    const { idEmpresa, idSucursal } = req.params;
  
    try {
      // Obtener los datos de la sucursal seleccionada
      const [sucursal] = await pool.query('SELECT * FROM inv_sucursales WHERE idSucursal = ?', [idSucursal]);
  
      if (sucursal.length > 0) {
        res.render('eliminarSucursal', { sucursal: sucursal[0], idEmpresa });
      } else {
        res.send('Sucursal no encontrada.');
      }
    } catch (err) {
      res.send('Error al cargar la sucursal.');
    }
  });
  
  // Manejar el POST para eliminar una sucursal
 app.post('/empresa/:idEmpresa/sucursal/:idSucursal/eliminar', async (req, res) => {
    const { idEmpresa, idSucursal } = req.params;
  
    try {
      // Eliminar la sucursal de la base de datos
      await pool.query('DELETE FROM inv_sucursales WHERE idSucursal = ?', [idSucursal]);
  
      res.redirect(`/empresa/${idEmpresa}/sucursales`);
    } catch (err) {
      res.send('Error al eliminar la sucursal.');
    }
  });
  
  
// Escuchar en puerto 3000
app.listen(3000, () => {
  console.log('Servidor ejecutándose en http://localhost:3000');
});

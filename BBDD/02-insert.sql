SET client_encoding = 'UTF8';

INSERT INTO buscyl.roles (nombre) VALUES
    ('administrador'),
    ('coordinador empresa'),
    ('conductor'),
    ('pasajero');


INSERT INTO buscyl.provincias (nombre) VALUES
    ('Ávila'),
    ('Burgos'),
    ('León'),
    ('Palencia'),
    ('Salamanca'),
    ('Segovia'),
    ('Soria'),
    ('Valladolid'),
    ('Zamora');

INSERT INTO buscyl.localidades (nombre, id_provincia)
SELECT v.nombre, p.id
FROM (VALUES
    ('Ávila',                     'Ávila'),
    ('Arévalo',                   'Ávila'),
    ('Arenas de San Pedro',       'Ávila'),
    ('Candeleda',                 'Ávila'),

    ('Burgos',                    'Burgos'),
    ('Aranda de Duero',           'Burgos'),
    ('Miranda de Ebro',           'Burgos'),
    ('Briviesca',                 'Burgos'),

    ('León',                      'León'),
    ('Ponferrada',                'León'),
    ('San Andrés del Rabanedo',   'León'),
    ('Astorga',                   'León'),

    ('Palencia',                  'Palencia'),
    ('Aguilar de Campoo',         'Palencia'),
    ('Venta de Baños',            'Palencia'),
    ('Villamuriel de Cerrato',    'Palencia'),

    ('Salamanca',                 'Salamanca'),
    ('Béjar',                     'Salamanca'),
    ('Ciudad Rodrigo',            'Salamanca'),
    ('Santa Marta de Tormes',     'Salamanca'),

    ('Segovia',                   'Segovia'),
    ('Cuéllar',                   'Segovia'),
    ('El Espinar',                'Segovia'),
    ('Sepúlveda',                 'Segovia'),

    ('Soria',                     'Soria'),
    ('Almazán',                   'Soria'),
    ('El Burgo de Osma',          'Soria'),
    ('Ágreda',                    'Soria'),

    ('Valladolid',                'Valladolid'),
    ('Medina del Campo',          'Valladolid'),
    ('Laguna de Duero',           'Valladolid'),
    ('Tordesillas',               'Valladolid'),

    ('Zamora',                    'Zamora'),
    ('Benavente',                 'Zamora'),
    ('Toro',                      'Zamora'),
    ('Morales del Vino',          'Zamora')
) AS v(nombre, provincia)
JOIN buscyl.provincias p ON p.nombre = v.provincia;

INSERT INTO buscyl.empresas (nombre, razon_social, cif, telefono, email, direccion, id_localidad)
SELECT v.nombre, v.razon_social, v.cif, v.telefono, v.email, v.direccion, l.id
FROM (VALUES
    ('Autobuses Ávila',   'Autobuses Ávila, S.L.',   'B05012345', '920123456', 'info@autobusesavila.es',   'Av. de Madrid 12',     'Ávila'),
    ('Transportes Burgos','Transportes Burgos, S.A.', 'A09012345', '947123456', 'info@transportesburgos.es','C/ Vitoria 45',        'Burgos'),
    ('Viajes León',       'Viajes León, S.L.',        'B24012345', '987123456', 'info@viajesleon.es',       'Av. de Astorga 8',     'León'),
    ('Rutas del Duero',   'Rutas del Duero, S.L.',    'B47012345', '983123456', 'info@rutasdelduero.es',    'Paseo de Zorrilla 120','Valladolid')
) AS v(nombre, razon_social, cif, telefono, email, direccion, localidad)
JOIN buscyl.localidades l ON l.nombre = v.localidad;

INSERT INTO buscyl.usuarios (email, id_rol, nombre, apellidos, dni, telefono, contrasena, fecha_nacimiento, fecha_registro, id_empresa, activo)
SELECT v.email, r.id, v.nombre, v.apellidos, v.dni, v.telefono, v.contrasena, v.fecha_nacimiento, v.fecha_registro, e.id, v.activo
FROM (VALUES
    ('admin@buscyl.es', 'administrador', 'Carmen', 'Delgado Iglesias', '12345678Z', '600100001',
     '$2a$10$xD/cFH82EhcKyBscLPxaweehtmuzRoJFJur1K8su9CRstyzLcj47e',
     DATE '1978-03-14', DATE '2025-01-10', NULL::text, TRUE),

    ('coordinacion@autobusesavila.es', 'coordinador empresa', 'Javier', 'Merino Sanz', '23456789D', '600100002',
     '$2a$10$EBgEktrRPRBS3A4PhsHb/eQhrpkTg7qqbxVHYLf.jmTOD4PpDlznm',
     DATE '1983-07-22', DATE '2025-02-01', 'Autobuses Ávila', TRUE),

    ('conductor@transportesburgos.es', 'conductor', 'Rubén', 'Ortega Gil', '34567890V', '600100003',
     '$2a$10$eRgkSeCQejfuGuogg7kRDOKmVlphbRiknBlfM3cBSPI2J6W/U8iA.',
     DATE '1990-11-05', DATE '2025-03-15', 'Transportes Burgos', TRUE),

    ('pasajero@buscyl.es', 'pasajero', 'Lucía', 'Fernández Prieto', '45678901G', '600100004',
     '$2a$10$.4d0cgWN7LlhQgEKsn.u6eXqTHOLJCg9Qf0b1Gqiu4mvOq/3jo486',
     DATE '1998-09-30', DATE '2025-04-20', NULL::text, TRUE)
) AS v(email, rol, nombre, apellidos, dni, telefono, contrasena, fecha_nacimiento, fecha_registro, empresa, activo)
JOIN buscyl.roles r ON r.nombre = v.rol
LEFT JOIN buscyl.empresas e ON e.nombre = v.empresa;

INSERT INTO buscyl.autobuses (matricula, id_empresa, numero_bastidor, numero_flota)
SELECT v.matricula, e.id, v.numero_bastidor, v.numero_flota
FROM (VALUES
    ('1234ABC', 'Autobuses Ávila',    'WVWZZZ1JZXW000001', 'AV-01'),
    ('2345BCD', 'Autobuses Ávila',    'WVWZZZ1JZXW000002', 'AV-02'),
    ('3456CDE', 'Autobuses Ávila',    'WVWZZZ1JZXW000003', 'AV-03'),
    ('4567DEF', 'Transportes Burgos', 'WVWZZZ1JZXW000004', 'BU-01'),
    ('5678EFG', 'Transportes Burgos', 'WVWZZZ1JZXW000005', 'BU-02'),
    ('6789FGH', 'Transportes Burgos', 'WVWZZZ1JZXW000006', 'BU-03'),
    ('7890GHJ', 'Viajes León',        'WVWZZZ1JZXW000007', 'LE-01'),
    ('8901HJK', 'Viajes León',        'WVWZZZ1JZXW000008', 'LE-02'),
    ('9012JKL', 'Viajes León',        'WVWZZZ1JZXW000009', 'LE-03'),
    ('1122KLM', 'Rutas del Duero',    'WVWZZZ1JZXW000010', 'VA-01'),
    ('2233LMN', 'Rutas del Duero',    'WVWZZZ1JZXW000011', 'VA-02'),
    ('3344MNP', 'Rutas del Duero',    'WVWZZZ1JZXW000012', 'VA-03')
) AS v(matricula, empresa, numero_bastidor, numero_flota)
JOIN buscyl.empresas e ON e.nombre = v.empresa;

INSERT INTO buscyl.asientos (id_autobus, numero, tipo, activo)
SELECT a.id,
       n,
       CASE WHEN n <= 2 THEN 'adaptado' ELSE 'normal' END,
       TRUE
FROM buscyl.autobuses a
CROSS JOIN generate_series(1, 55) AS n;

DROP TABLE IF EXISTS tmp_rutas;

CREATE TEMP TABLE tmp_rutas (
    numero_flota   VARCHAR(20),
    origen         VARCHAR(100),
    intermedia_1   VARCHAR(100),
    intermedia_2   VARCHAR(100),
    destino        VARCHAR(100),
    dias_desde_hoy INTEGER,
    hora_salida    TIME
);

INSERT INTO tmp_rutas VALUES
    ('AV-01', 'Ávila',            'Arévalo',             'Medina del Campo',     'Valladolid', 1, TIME '08:00'),
    ('AV-02', 'Candeleda',        'Arenas de San Pedro', 'Ávila',                'Segovia',    2, TIME '09:00'),
    ('AV-03', 'Ávila',            'Arévalo',             'El Espinar',           'Segovia',    3, TIME '07:30'),
    ('BU-01', 'Burgos',           'Aranda de Duero',     'Palencia',             'Valladolid', 1, TIME '08:15'),
    ('BU-02', 'Burgos',           'Aranda de Duero',     'El Burgo de Osma',     'Soria',      4, TIME '10:00'),
    ('BU-03', 'Miranda de Ebro',  'Briviesca',           'Burgos',               'Palencia',   5, TIME '09:30'),
    ('LE-01', 'León',             'Astorga',             'Benavente',            'Zamora',     2, TIME '08:00'),
    ('LE-02', 'León',             'San Andrés del Rabanedo', 'Astorga',          'Ponferrada', 6, TIME '11:00'),
    ('LE-03', 'Ponferrada',       'Astorga',             'Benavente',            'Zamora',     7, TIME '08:45'),
    ('VA-01', 'Valladolid',       'Tordesillas',         'Medina del Campo',     'Salamanca',  3, TIME '09:15'),
    ('VA-02', 'Valladolid',       'Palencia',            'Villamuriel de Cerrato','Aguilar de Campoo', 8, TIME '10:30'),
    ('VA-03', 'Valladolid',       'Tordesillas',         'Toro',                 'Zamora',     9, TIME '08:30');

INSERT INTO buscyl.viajes (id_origen, id_destino, id_autobus, id_conductor, fecha_viaje, hora_salida, hora_llegada)
SELECT lo.id,
       ld.id,
       a.id,
       c.id,
       CURRENT_DATE + r.dias_desde_hoy,
       r.hora_salida,
       r.hora_salida + INTERVAL '135 minutes'
FROM tmp_rutas r
JOIN buscyl.autobuses a ON a.numero_flota = r.numero_flota
JOIN buscyl.localidades lo ON lo.nombre = r.origen
JOIN buscyl.localidades ld ON ld.nombre = r.destino
JOIN buscyl.usuarios c ON c.email = 'conductor@transportesburgos.es';

INSERT INTO buscyl.paradas (id_viaje, id_localidad, hora_llegada, hora_salida, direccion, orden)
SELECT v.id,
       l.id,
       r.hora_salida + (p.orden - 1) * INTERVAL '45 minutes',
       CASE WHEN p.orden < 4
            THEN r.hora_salida + (p.orden - 1) * INTERVAL '45 minutes' + INTERVAL '5 minutes'
            ELSE r.hora_salida + (p.orden - 1) * INTERVAL '45 minutes'
       END,
       'Estación de autobuses de ' || l.nombre,
       p.orden
FROM tmp_rutas r
JOIN buscyl.autobuses a ON a.numero_flota = r.numero_flota
JOIN buscyl.viajes v ON v.id_autobus = a.id
CROSS JOIN LATERAL (VALUES
    (1, r.origen),
    (2, r.intermedia_1),
    (3, r.intermedia_2),
    (4, r.destino)
) AS p(orden, localidad)
JOIN buscyl.localidades l ON l.nombre = p.localidad;

DROP TABLE tmp_rutas;

INSERT INTO buscyl.reservas (id_pasajero, id_viaje, id_asiento, id_parada_origen, id_parada_destino,
                             estado, fecha_reserva, fecha_cancelacion, codigo_qr)
SELECT pas.id,
       v.id,
       asi.id,
       po.id,
       pd.id,
       r.estado,
       CURRENT_DATE - r.dias_reserva,
       CASE WHEN r.estado = 'cancelada' THEN CURRENT_DATE - r.dias_reserva + 2 END,
       'QR-' || a.numero_flota || '-' || asi.numero
FROM (VALUES
    ('AV-01', 10, 1, 4, 'confirmada', 5),
    ('AV-02', 12, 1, 4, 'confirmada', 6),
    ('AV-03', 15, 2, 4, 'confirmada', 4),
    ('BU-01', 20, 1, 3, 'confirmada', 7),
    ('BU-02',  8, 1, 4, 'confirmada', 3),
    ('BU-03', 30, 1, 2, 'confirmada', 2),
    ('LE-01', 45, 1, 4, 'confirmada', 8),
    ('LE-02',  5, 1, 4, 'cancelada',  9),
    ('VA-01', 22, 1, 3, 'confirmada', 6),
    ('VA-02', 50, 2, 4, 'cancelada', 10)
) AS r(numero_flota, numero_asiento, orden_origen, orden_destino, estado, dias_reserva)
JOIN buscyl.autobuses a ON a.numero_flota = r.numero_flota
JOIN buscyl.viajes v ON v.id_autobus = a.id
JOIN buscyl.asientos asi ON asi.id_autobus = a.id AND asi.numero = r.numero_asiento
JOIN buscyl.paradas po ON po.id_viaje = v.id AND po.orden = r.orden_origen
JOIN buscyl.paradas pd ON pd.id_viaje = v.id AND pd.orden = r.orden_destino
JOIN buscyl.usuarios pas ON pas.email = 'pasajero@buscyl.es';

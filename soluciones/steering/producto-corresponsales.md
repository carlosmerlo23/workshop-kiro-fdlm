# Contexto de producto: Red de Corresponsales

## Quiénes somos

Fundación delamujer es una entidad microfinanciera colombiana enfocada en la inclusión financiera de
mujeres microempresarias, con presencia en zonas donde no hay oficinas cercanas.

## Qué hace este servicio

Autoriza y registra transacciones de la red de corresponsales: comercios aliados que prestan
servicios financieros en nombre de la entidad y reciben una comisión por transacción.

## Tipos de transacción soportados

`DEPOSITO`, `RETIRO`, `PAGO_CREDITO`, `RECAUDO`, `CONSULTA_SALDO`.

Las tarifas y límites de cada tipo están en `src/corresponsales/tarifas.js`. Ese archivo es la
fuente de verdad: no dupliques sus valores en otro lugar del código.

## Reglas invariantes del negocio

- Toda transacción aprobada genera un comprobante con consecutivo único que se entrega al cliente.
- Los montos son en pesos colombianos y **siempre son enteros**. No existen centavos. Todo cálculo
  monetario se redondea al peso.
- Un `RETIRO` entrega efectivo del comercio, por lo que valida el cupo disponible del corresponsal.
- La red opera entre las 6:00 y las 21:00.
- Los puntos operan con conectividad intermitente: **el reintento es el caso normal, no la
  excepción**. Toda operación debe ser idempotente.
- Los motivos de rechazo (`TIPO_NO_SOPORTADO`, `LIMITE_EXCEDIDO`, `CUPO_INSUFICIENTE`,
  `FUERA_DE_HORARIO`) son códigos estables que consumen sistemas externos. No se renombran sin
  coordinación.

## Manejo de datos

- Nunca uses datos reales de clientes en ejemplos, tests, documentación o prompts. Usa datos ficticios.
- No registres en logs el documento de identidad completo del cliente ni montos asociados a una
  persona identificable.

## Alcance

Las tarifas y límites de este repositorio son didácticos. Cualquier cambio con efecto real debe
validarse contra la normativa vigente de corresponsales y las políticas internas de la entidad.

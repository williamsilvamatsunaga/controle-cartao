import { parseOfxExtrato } from '../parse-ofx';

describe('parseOfxExtrato', () => {
  test('parse_ofxComCreditosEDebitos_extraiLancamentos', () => {
    const ofx = `
OFXHEADER:100
DATA:OFXSGML
VERSION:102
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>CREDIT
            <DTPOSTED>20260105
            <TRNAMT>4500.00
            <MEMO>SALARIO EMPRESA XYZ
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>DEBIT
            <DTPOSTED>20260106
            <TRNAMT>-89.90
            <MEMO>PIX MERCADO
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

    const result = parseOfxExtrato(ofx);

    expect(result).toEqual([
      {
        data: '2026-01-05',
        descricao: 'SALARIO EMPRESA XYZ',
        valor: 4500,
        tipo: 'credito',
      },
      {
        data: '2026-01-06',
        descricao: 'PIX MERCADO',
        valor: 89.9,
        tipo: 'debito',
      },
    ]);
  });
});

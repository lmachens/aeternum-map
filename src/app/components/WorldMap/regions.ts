import leaflet from 'leaflet';
import type geojson from 'geojson';

const COLOR = 'rgb(200 200 200)';

const regions: geojson.GeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: '01',
      properties: { name: 'Cutlass Keys' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [6122.5, 79.48727984344424],
            [6171, 37.906066536203525],
            [6407, 27.38551859099806],
            [6738.5, 20.872798434442302],
            [6802, 6.845401174168273],
            [6951, 64.88649706457926],
            [7144, 96.94911937377691],
            [7277, 73.90410958904113],
            [7651, -7.254403131115396],
            [7914, -8.256360078277908],
            [8076, 79.68688845401175],
            [8264, 304.1252446183953],
            [8420, 432.3757338551859],
            [8421.25, 475.5],
            [8357, 588.2778864970646],
            [8318, 748.5909980430529],
            [8301, 836.7632093933464],
            [8230, 911.9099804305283],
            [8210, 991.06457925636],
            [8212, 1131.3385518590999],
            [8206, 1252.5753424657532],
            [8173, 1311.6908023483365],
            [8181, 1397.859099804305],
            [8201, 1483.0254403131114],
            [8176, 1553.1624266144813],
            [8087, 1666.3835616438355],
            [8079, 1692.4344422700588],
            [8109, 1749.545988258317],
            [8112, 1858.7592954990216],
            [8100, 1899.839530332681],
            [8044, 1957.9530332681018],
            [8035, 1978.9941291585128],
            [8026, 2038.1095890410961],
            [8007, 2053.138943248532],
            [7974, 2078.187866927593],
            [7976, 2142.3131115459882],
            [7963, 2150.328767123288],
            [7874.5, 2172.325831702544],
            [7864.5, 2178.087084148728],
            [7865.75, 2221.9227005870844],
            [7833, 2332.1428571428573],
            [7827, 2346.6712328767126],
            [7817, 2352.682974559687],
            [7795, 2353.183953033268],
            [7792.5, 2345.66927592955],
            [7788.5, 2318.1154598825833],
            [7771.5, 2310.099804305284],
            [7753, 2249.9823874755384],
            [7675, 2209.904109589041],
            [7665.5, 2200.3855185909983],
            [7625, 2119.227005870842],
            [7516.5, 2043.0782778864973],
            [7481.5, 2025.5440313111549],
            [7408, 2004.5029354207438],
            [7309, 2014.0215264187868],
            [7259, 2042.076320939335],
            [7186.5, 2038.5694716242665],
            [7171, 2034.0606653620355],
            [7160.5, 1979.4540117416832],
            [7147, 1951.3992172211351],
            [7046, 1944.8864970645795],
            [6955, 1891.2818003913897],
            [6549, 1703.0234833659497],
            [6340, 1569.5499021526427],
            [6266, 1351.1232876712338],
            [6184, 1121.2994129158528],
            [6008, 872.814090019571],
            [6020, 664.4070450097863],
            [6124, 520.1252446183971],
            [6176, 351.79647749510934],
            [6080, 243.58512720156727],
            [6060, 147.39726027397433],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: '02',
      properties: { name: 'First Light' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [8421.25, 475.5],
            [8552, 508.082191780822],
            [8644, 516.0978473581214],
            [8738, 484.0352250489236],
            [8816, 441.95303326810176],
            [8888, 371.81604696673185],
            [8928, 305.68688845401175],
            [9016, 237.55381604696674],
            [9172, 169.42074363992174],
            [9444, 117.31898238747556],
            [9700, 63.21330724070458],
            [9900, 49.18590998043055],
            [10020, 51.18982387475535],
            [10128, 95.27592954990223],
            [10152, 159.40117416829753],
            [10132, 275.6281800391389],
            [10098, 453.9765166340509],
            [10068, 572.2074363992172],
            [10056, 638.3365949119374],
            [10066, 704.4657534246576],
            [10164, 910.8688845401174],
            [10252, 1091.2211350293542],
            [10276, 1335.6986301369861],
            [10266, 1439.9021526418787],
            [10152, 1588.1917808219177],
            [10066, 1602.2191780821918],
            [9950, 1574.164383561644],
            [9890, 1594.2035225048926],
            [9870, 1630.2739726027398],
            [9876, 1734.4774951076322],
            [9854, 1840.6849315068494],
            [9764, 1934.8688845401175],
            [9684, 1979.2367906066536],
            [9610, 2060.39530332681],
            [9541, 2138.5479452054797],
            [9453, 2188.645792563601],
            [9423, 2183.6360078277885],
            [9237, 2086.446183953033],
            [9205, 2075.4246575342468],
            [9123, 2074.4227005870844],
            [9091, 2088.4500978473584],
            [9065, 2087.4481409001955],
            [9038, 2060.3953033268103],
            [9016, 2065.4050880626223],
            [8949, 2106.485322896282],
            [8929, 2108.489236790607],
            [8830, 2036.348336594912],
            [8811, 2027.3307240704503],
            [8680, 2042.3600782778867],
            [8664, 2041.3581213307243],
            [8574, 1997.2720156555774],
            [8478, 2036.348336594912],
            [8437, 2085.4442270058707],
            [8386, 2126.5244618395304],
            [8336, 2150.5714285714284],
            [8287.25, 2237.4310176125246],
            [8241.5, 2230.283757338552],
            [8235.5, 2213.751467710372],
            [8189, 2194.2133072407046],
            [8178, 2125.078277886497],
            [8165, 2089.0078277886496],
            [8084, 2038.4090019569471],
            [8044.5, 2030.3933463796477],
            [8026.5, 2037.4070450097847],
            [8035, 1978.9941291585128],
            [8044, 1957.9530332681018],
            [8100, 1899.839530332681],
            [8112, 1858.7592954990216],
            [8109, 1749.545988258317],
            [8079, 1692.4344422700588],
            [8087, 1666.3835616438355],
            [8176, 1553.1624266144813],
            [8201, 1483.0254403131114],
            [8181, 1397.859099804305],
            [8173, 1311.6908023483365],
            [8206, 1252.5753424657532],
            [8212, 1131.3385518590999],
            [8210, 991.06457925636],
            [8230, 911.9099804305283],
            [8301, 836.7632093933464],
            [8318, 748.5909980430529],
            [8357, 588.2778864970646],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: '03',
      properties: { name: 'Windsward' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [8698, 3724.3561643835615],
            [8746.5, 3723.46771037182],
            [8797, 3688.9001956947163],
            [9218.75, 3593.9730919765166],
            [9258.75, 3561.6599804305283],
            [9308, 3441.3454011741683],
            [9441, 3390.746575342466],
            [9663.25, 3429.792563600783],
            [9739.25, 3302.487769080235],
            [9877.5, 3294.9657534246576],
            [9918.25, 3120.763698630137],
            [9990.5, 3087.9496086105673],
            [10204, 3129.520547945205],
            [10255, 3083.430528375733],
            [10228, 2849.4735812133067],
            [10181, 2786.350293542074],
            [10187, 2697.677103718199],
            [10254.5, 2594.9765166340503],
            [10274.5, 2453.7005870841476],
            [10270.5, 2322.945205479451],
            [10239, 2283.3679060665354],
            [10222, 2114.4990215264165],
            [10120, 2112.495107632092],
            [9764, 1934.8688845401175],
            [9684, 1979.2367906066536],
            [9610, 2060.39530332681],
            [9541, 2138.5479452054797],
            [9453, 2188.645792563601],
            [9423, 2183.6360078277885],
            [9237, 2086.446183953033],
            [9205, 2075.4246575342468],
            [9123, 2074.4227005870844],
            [9091, 2088.4500978473584],
            [9065, 2087.4481409001955],
            [9038, 2060.3953033268103],
            [9016, 2065.4050880626223],
            [8949, 2106.485322896282],
            [8929, 2108.489236790607],
            [8830, 2036.348336594912],
            [8811, 2027.3307240704503],
            [8680, 2042.3600782778867],
            [8664, 2041.3581213307243],
            [8574, 1997.2720156555774],
            [8478, 2036.348336594912],
            [8437, 2085.4442270058707],
            [8386, 2126.5244618395304],
            [8336, 2150.5714285714284],
            [8287.25, 2237.4310176125246],
            [8254.5, 2345.5410958904113],
            [8254.5, 2382.613502935421],
            [8223, 2427.7015655577297],
            [8208.5, 2500.343444227006],
            [8350.5, 2568.4765166340508],
            [8361, 2628.5939334637965],
            [8249.5, 2687.208414872798],
            [8234.5, 2822.973581213307],
            [8261.5, 2864.554794520548],
            [8280, 2893.6115459882585],
            [8233, 2921.6663405088066],
            [8183, 2930.683953033268],
            [8219.5, 3010.8405088062623],
            [8233.5, 3067.9520547945203],
            [8275, 3080.9774951076324],
            [8316.5, 3072.4608610567516],
            [8369, 3085.486301369863],
            [8374.5, 3171.1536203522505],
            [8410.5, 3203.7172211350294],
            [8499, 3237.783757338552],
            [8545.5, 3270.3473581213307],
            [8661, 3247.8033268101763],
            [8686, 3437.173189823875],
            [8689, 3506.8365949119375],
            [8653.5, 3559.940313111546],
            [8652, 3626.5704500978472],
            [8679, 3691.1966731898237],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: '04',
      properties: { name: "Monarch's Bluffs" },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [6590, 1722.0234833659492],
            [6600, 1812.1996086105676],
            [6522, 2046.6575342465753],
            [6518, 2138.8375733855187],
            [6562, 2267.0880626223093],
            [6560, 2355.2602739726026],
            [6474, 2461.46771037182],
            [6190, 2864.2544031311154],
            [6184, 2994.508806262231],
            [6246, 3056.6301369863013],
            [6276, 3106.7279843444226],
            [6252, 3112.739726027397],
            [6170, 3132.7788649706454],
            [6106, 3212.93542074364],
            [6066, 3355.2133072407046],
            [6068, 3453.4050880626223],
            [6086, 3738.0019569471624],
            [6320, 3742.009784735812],
            [6524, 3868.5753424657532],
            [6624, 3884.6066536203525],
            [6844, 3886.6105675146773],
            [6952, 3848.536203522505],
            [7068, 3888.3463796477495],
            [7160, 4149.8688845401175],
            [7242, 4256.076320939334],
            [7509, 4498.549902152642],
            [7640, 4540.632093933464],
            [7810, 4395.348336594912],
            [7915.5, 4383.1042074363995],
            [7951.25, 4355.800880626223],
            [7967.75, 4299.691291585127],
            [8051.75, 4332.254892367906],
            [8102.5, 4241.151663405088],
            [8285, 4215.100782778865],
            [8364, 4085.3473581213307],
            [8420, 4029.2377690802346],
            [8481.5, 3933.5508806262233],
            [8487, 3908.000978473581],
            [8453, 3865.417808219178],
            [8418, 3734.8953033268103],
            [8494.75, 3718.182974559687],
            [8574.75, 3748.4921722113504],
            [8698, 3724.3561643835615],
            [8679, 3691.1966731898237],
            [8652, 3626.5704500978472],
            [8653.5, 3559.940313111546],
            [8689, 3506.8365949119375],
            [8686, 3437.173189823875],
            [8661, 3247.8033268101763],
            [8545.5, 3270.3473581213307],
            [8499, 3237.783757338552],
            [8410.5, 3203.7172211350294],
            [8374.5, 3171.1536203522505],
            [8369, 3085.486301369863],
            [8316.5, 3072.4608610567516],
            [8275, 3080.9774951076324],
            [8233.5, 3067.9520547945203],
            [8219.5, 3010.8405088062623],
            [8183, 2930.683953033268],
            [8233, 2921.6663405088066],
            [8280, 2893.6115459882585],
            [8261.5, 2864.554794520548],
            [8234.5, 2822.973581213307],
            [8249.5, 2687.208414872798],
            [8361, 2628.5939334637965],
            [8350.5, 2568.4765166340508],
            [8208.5, 2500.343444227006],
            [8223, 2427.7015655577297],
            [8254.5, 2382.613502935421],
            [8254.5, 2345.5410958904113],
            [8287.25, 2237.4310176125246],
            [8241.5, 2230.283757338552],
            [8235.5, 2213.751467710372],
            [8189, 2194.2133072407046],
            [8178, 2125.078277886497],
            [8165, 2089.0078277886496],
            [8084, 2038.4090019569471],
            [8044.5, 2030.3933463796477],
            [8026.5, 2037.4070450097847],
            [7974, 2078.187866927593],
            [7976, 2142.3131115459882],
            [7963, 2150.328767123288],
            [7874.5, 2172.325831702544],
            [7864.5, 2178.087084148728],
            [7865.75, 2221.9227005870844],
            [7833, 2332.1428571428573],
            [7827, 2346.6712328767126],
            [7817, 2352.682974559687],
            [7795, 2353.183953033268],
            [7792.5, 2345.66927592955],
            [7788.5, 2318.1154598825833],
            [7771.5, 2310.099804305284],
            [7753, 2249.9823874755384],
            [7675, 2209.904109589041],
            [7665.5, 2200.3855185909983],
            [7625, 2119.227005870842],
            [7516.5, 2043.0782778864973],
            [7481.5, 2025.5440313111549],
            [7408, 2004.5029354207438],
            [7309, 2014.0215264187868],
            [7259, 2042.076320939335],
            [7186.5, 2038.5694716242665],
            [7171, 2034.0606653620355],
            [7160.5, 1979.4540117416832],
            [7147, 1951.3992172211351],
            [7046, 1944.8864970645795],
            [6955, 1891.2818003913897],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: '05',
      properties: { name: 'Ebonscale Reach' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [6086, 3738.0019569471624],
            [6094, 4070.7710371819962],
            [5086, 4076.7827788649706],
            [4970, 4132.892367906066],
            [4610, 4126.880626223092],
            [4518, 4164.954990215264],
            [4456, 4267.154598825831],
            [4456, 4449.510763209393],
            [4562, 4609.823874755381],
            [4820, 4693.988258317026],
            [5194, 4647.8982387475535],
            [5386, 5028.641878669276],
            [5602, 5110.802348336595],
            [5620, 5206.990215264188],
            [5502, 5385.3385518591],
            [5542, 5639.835616438357],
            [5730, 5764.078277886497],
            [5852, 5818.183953033268],
            [6132, 5778.105675146771],
            [6382, 5964.469667318982],
            [6486, 6054.6457925636005],
            [6552, 6066.669275929549],
            [6558, 6130.7945205479455],
            [6527, 6224.522504892368],
            [7050.5, 6355.8933463796475],
            [7104, 6329.842465753425],
            [7287, 6381.944227005871],
            [7342, 6454.085127201565],
            [7431, 6476.128180039139],
            [7542.5, 6419.517612524462],
            [7730, 6502.179060665362],
            [7755.5, 6569.811154598826],
            [7666, 6689.044031311155],
            [7664.5, 6761.685909980431],
            [7743, 6884.926614481409],
            [7819, 6888.433463796478],
            [7890.5, 6918.49217221135],
            [7911, 6983.619373776908],
            [7966.5, 7015.681996086107],
            [7987.5, 7056.762230919766],
            [8079.5, 7122.390410958905],
            [8097.5, 7261.662426614483],
            [8462, 7277.698630136986],
            [8587, 7203.052837573386],
            [8673, 6970.933463796478],
            [8758.5, 6942.377690802348],
            [8777, 6889.273972602739],
            [8686, 6811.622309197652],
            [8683.5, 6673.352250489237],
            [8701, 6428.874755381605],
            [8643, 6360.74168297456],
            [8617, 6204.937377690802],
            [8593.5, 6199.927592954989],
            [8412, 6272.569471624266],
            [8301, 6210.4481409001955],
            [8228, 6123.778864970645],
            [8264.5, 6044.123287671233],
            [8256.5, 5976.491193737769],
            [8288.5, 5928.397260273972],
            [8260, 5606.769080234833],
            [8377, 5426.6360078277885],
            [8292.5, 5158.836594911937],
            [8214, 4867.764187866927],
            [8069.5, 4873.775929549902],
            [7812.5, 4792.617416829746],
            [7640.25, 4540.125733855186],
            [7509, 4498.549902152642],
            [7242, 4256.076320939334],
            [7160, 4149.8688845401175],
            [7068, 3888.3463796477495],
            [6952, 3848.536203522505],
            [6844, 3886.6105675146773],
            [6624, 3884.6066536203525],
            [6524, 3868.5753424657532],
            [6320, 3742.009784735812],
          ],
        ],
      },
    },
  ],
};

export function drawRegions(map: leaflet.Map) {
  const geoJSON = leaflet.geoJSON(regions, {
    style: {
      color: COLOR,
      fill: false,
    },
    interactive: false,
    pmIgnore: true,
  });
  geoJSON.addTo(map);
}

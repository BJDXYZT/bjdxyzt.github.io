// 

document.getElementById('calculate-button').addEventListener('click', function() {
    const param = document.getElementById('param').value;
    const precision = document.getElementById('precision').value;
    const hardware = document.getElementById('hardware').value;
    const context = document.getElementById('context').value;
    const concurrency = document.getElementById('concurrency').value;

    const resultsDiv = document.getElementById('results');

    var result = calculateResult(param, precision, context, concurrency, hardware);

    resultsDiv.innerHTML = '<h2>计算结果:</h2>';

    resultsDiv.innerHTML += `
        <hr>
        <div class="result-item"><strong>模型参数:</strong> ${param}B </div>
        <div class="result-item"><strong>精度:</strong> ${precision}</div>
        <div class="result-item"><strong>算力卡:</strong> ${getHardwareDisplayName(hardware)}</div>
        <div class="result-item"><strong>模型权重显存需求: </strong>${result.weightMemory}GB</div>
        <div class="result-item"><strong>KV cache 显存需求: </strong>${result.kvCacheMemory}GB</div>
        <div class="result-item"><strong>总显存需求: </strong> ${result.totalMemory}GB</div>
        <div class="result-item"><strong>预估算力卡需求:</strong> ${result.compute} 张</div>
        <div class="result-item"><strong>预估算力机台数:</strong> ${result.machineCount} 台</div>
    `;

});

function calculateResult(param, precision, context, concurrency, hardware) {
    weightMemory = calculateWeightMemory(param, precision);
    kvCacheMemory = calculateKVCacheMemory(param, precision, context, concurrency);
    totalMemory = calculateTotalMemory(weightMemory, kvCacheMemory);
    compute = calculateCompute(totalMemory, hardware);
    machineCount = calculateMachineCount(compute);
    return {
        weightMemory: weightMemory,
        kvCacheMemory: kvCacheMemory,
        totalMemory: totalMemory,
        compute: compute,
        machineCount: machineCount,
    };
}

function getHardwareDisplayName(hardware) {
    const hardwareDisplayNames = {
        'ascend_910b_64g': '昇腾910b(64G)',
        'ascend_910b_32g': '昇腾910b(32G)',
        'nvidia_a800_40g': 'NVIDIA A800(40G)',
        'nvidia_a100_80g': 'NVIDIA A100(80G)',
        'nvidia_a100_40g': 'NVIDIA A100(40G)',
        'nvidia_a100_80g': 'NVIDIA A100(80G)',
        'nvidia_a10': 'NVIDIA A10',
        'nvidia_h20': 'NVIDIA H20',
        'nvidia_h800': 'NVIDIA H800',
        'nvidia_l40s': 'NVIDIA L40S',
        'nvidia_rtx4090': 'NVIDIA RTX 4090',
    };
    return hardwareDisplayNames[hardware] || hardware;
}

function calculateWeightMemory(param, precision) {
    const precisionDict = {
        'FP16': 2,
        'FP32': 4,
        'BF16': 2,
        'INT8': 1,
        'INT4': 0.5,
        'FP8': 1,
    }
    paramSize = precisionDict[precision];
    weightMemory = param * paramSize;
    weightMemory = weightMemory.toFixed(2);
    return weightMemory;
}

function calculateKVCacheMemory(param, precision, context, concurrency) {
    const modelArchParams = {
        '671': {layers: 61, hidden_dim: 7168},
        '1.5': {layers: 28, hidden_dim: 2020},
        '7':   {layers: 34, hidden_dim: 4096},
        '8':   {layers: 32, hidden_dim: 4096},
        '14':  {layers: 69, hidden_dim: 4096},
        '32':  {layers: 64, hidden_dim: 6400},
        '70':  {layers: 80, hidden_dim: 8192}
    };

    const precisionDict = {
        'FP16': 2,
        'FP32': 4,
        'BF16': 2,
        'INT8': 1,
        'INT4': 0.5,
        'FP8': 1,
    }

    model = modelArchParams[param];
    kvCacheMemory = 2 * model.layers * model.hidden_dim * precisionDict[precision] * context * concurrency / 1024 / 1024 / 1024;
    kvCacheMemory = kvCacheMemory.toFixed(2);
    return kvCacheMemory;
}

function calculateTotalMemory(weightMemory, kvCacheMemory) {
    totalMemory = parseFloat(weightMemory) + parseFloat(kvCacheMemory);;
    totalMemory = totalMemory.toFixed(2);
    return totalMemory;
    
}

function calculateCompute(totalMemory, hardware) {
    const hardwareCompute = {
        'ascend_910b_64g': 64,
        'ascend_910b_32g': 32,
        'nvidia_a800_40g': 40,
        'nvidia_a800_80g': 80,
        'nvidia_a100_40g': 40,
        'nvidia_a100_80g': 80,
        'nvidia_a10': 24,
        'nvidia_h20': 96,
        'nvidia_h800': 80,
        'nvidia_l40s': 48,
        'nvidia_rtx4090': 24,
    };
    compute = totalMemory / hardwareCompute[hardware];
    // console.log(weightMemory);
    // console.log(hardwareCompute[hardware]);
    // console.log(compute);
    compute = Math.ceil(compute);
    return compute;
}

function calculateMachineCount(compute) {
    machineCount = compute / 8;
    machineCount = Math.ceil(machineCount);
    return machineCount;
}



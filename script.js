// 

document.getElementById('calculate-button').addEventListener('click', function() {
    const param = document.getElementById('param').value;
    const precision = document.getElementById('precision').value;
    const hardware = document.getElementById('hardware').value;

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>计算结果:</h2>';

    resultsDiv.innerHTML += `
        <hr>
        <div class="result-item"><strong>模型参数:</strong> ${param}B </div>
        <div class="result-item"><strong>精度:</strong> ${precision}</div>
        <div class="result-item"><strong>算力卡:</strong> ${getHardwareDisplayName(hardware)}</div>
        <div class="result-item"><strong>模型权重显存需求: </strong>${calculateWeightMemory(param, precision)}G</div>
        <div class="result-item"><strong>总显存需求: </strong> ${calculateTotalMemory(param, precision)}G</div>
        <div class="result-item"><strong>预估算力卡需求:</strong> ${calculateCompute(param, precision, hardware)} 张</div>
        <div class="result-item"><strong>预估算力机台数:</strong> ${calculateMachineCount(param, precision, hardware)} 台</div>
    `;

});

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

function calculateTotalMemory(param, precision) {
    weightMemory = calculateWeightMemory(param, precision);
    totalMemory = weightMemory * 1.2;
    totalMemory = totalMemory.toFixed(2);
    return totalMemory;
}

function calculateCompute(param, precision, hardware) {
    weightMemory = calculateWeightMemory(param, precision);
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
    compute = weightMemory / hardwareCompute[hardware];
    console.log(weightMemory);
    console.log(hardwareCompute[hardware]);
    console.log(compute);
    compute = Math.ceil(compute);
    return compute;
}

function calculateMachineCount(param, precision, hardware) {
    compute = calculateCompute(param, precision, hardware);
    machineCount = compute / 8;
    machineCount = Math.ceil(machineCount);
    return machineCount;
}


